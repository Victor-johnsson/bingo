package main

import (
	"bingo/board"
	"bingo/otelx"
	"context"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-contrib/cors"

	"github.com/gin-gonic/gin"
	"go.opentelemetry.io/contrib/instrumentation/github.com/gin-gonic/gin/otelgin"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/metric"
)

var db = make(map[string]string)

var (
	name                  = os.Getenv("OTEL_SERVICE_NAME")
	isInsecure            bool
	otelTarget            string
	headers               map[string]string
	meter                 metric.Meter
	metricRequestTotal    metric.Int64Counter
	responseTimeHistogram metric.Int64Histogram
)

func setupRouter() *gin.Engine {
	// Disable Console Color
	// gin.DisableConsoleColor()

	r := gin.Default()
	r.Use(otelgin.Middleware(name))
	r.Use(monitorInterceptor())
	r.Use(cors.Default())

	r.GET("/board/:name", func(c *gin.Context) {
		name := c.Params.ByName("name")

		// Get the board from the map
		theBoard, err := board.GetBoard(name)

		if err != nil {
			c.String(http.StatusInternalServerError, err.Error())
			return
		}
		// This will now correctly send either the board from the map or the newly created one.
		c.JSON(http.StatusOK, theBoard)
	})
	r.PUT("/board/:name", func(c *gin.Context) {
		name := c.Params.ByName("name")

		body, readErr := io.ReadAll(c.Request.Body)
		if readErr != nil {
			c.String(http.StatusInternalServerError, readErr.Error())
			return
		}

		square := board.Question{}
		marshErr := json.Unmarshal(body, &square)
		if marshErr != nil {
			c.String(http.StatusInternalServerError, marshErr.Error())
			return
		}

		// Get the board from the map
        theBoard, err := board.UpdateBoard(name, square)
		if err != nil {
			c.String(http.StatusInternalServerError, err.Error())
			return
		}
		// This will now correctly send either the board from the map or the newly created one.
		c.JSON(http.StatusOK, theBoard)
	})

    r.GET("/questions", func(c *gin.Context) {
        questions := board.GetQuestions()
        c.JSON(http.StatusOK, questions)
    })

    r.POST("/questions", func(c *gin.Context) {
        body, readErr := io.ReadAll(c.Request.Body)
        if readErr != nil {
            c.String(http.StatusInternalServerError, readErr.Error())
            return
        }
        question := board.Question{}
        marshErr := json.Unmarshal(body, &question)
        if marshErr != nil {
            c.String(http.StatusInternalServerError, marshErr.Error())
            return
        }
        board.AddQuestion(question)
        c.JSON(http.StatusOK, question)
    })

	return r
}

func main() {
	otelEndpoint := strings.Split(os.Getenv("OTEL_EXPORTER_OTLP_ENDPOINT"), "https://")
	if len(otelEndpoint) > 1 {
		isInsecure = false
		otelTarget = otelEndpoint[1]
	} else {
		isInsecure = true
		otelTarget = strings.Split(os.Getenv("OTEL_EXPORTER_OTLP_ENDPOINT"), "http://")[1]
	}
	otelHeaders := strings.Split(os.Getenv("OTEL_EXPORTER_OTLP_HEADERS"), "=")
	if len(otelHeaders) > 1 {
		headers = map[string]string{otelHeaders[0]: otelHeaders[1]}
	}
	// Initialize OpenTelemetry
	err := otelx.SetupOTelSDK(context.Background(), otelTarget, isInsecure, headers, name)
	if err != nil {
		log.Printf("Failed to initialize OpenTelemetry: %v", err)
		return
	}
	defer func() {
		err = otelx.Shutdown(context.Background())
		if err != nil {
			log.Printf("Failed to shutdown OpenTelemetry: %v", err)
		}
	}()

	// Create a tracer and a meter
	meter = otel.Meter(name)
	initGinMetrics()

	r := setupRouter()

	// Listen and Server in 0.0.0.0:8080
	r.Run(":" + os.Getenv("PORT"))
}

func initGinMetrics() {

	metricRequestTotal, _ = meter.Int64Counter("gin_request_total",
		metric.WithDescription("all the server received request num."),
	)

	// Create a histogram to measure response time
	responseTimeHistogram, _ = meter.Int64Histogram("gin_response_time",
		metric.WithDescription("The distribution of response times."),
	)
}

// monitorInterceptor as gin monitor middleware.
func monitorInterceptor() gin.HandlerFunc {
	return func(c *gin.Context) {
		startTime := time.Now()

		// execute normal process.
		c.Next()

		// after request
		ginMetricHandle(c.Request.Context(), startTime)
	}
}

func removeFirstAndLastLine(s string) string {
	// 1. Split the string into a slice of lines.
	lines := strings.Split(s, "\n")

	// 2. If there are fewer than 3 lines (e.g., 0, 1, or 2), there's no
	// "middle" to return, so we return an empty string.
	if len(lines) < 5 {
		return ""
	}

	// 3. Take a sub-slice that starts from the second element (index 1)
	// and ends before the last element.
	middleLines := lines[2 : len(lines)-2]

	// 4. Join the sub-slice back into a single string, using newline
	// characters as the separator.
	return strings.Join(middleLines, "\n")
}
func ginMetricHandle(c context.Context, start time.Time) {
	// set request total
	metricRequestTotal.Add(c, 1)

	// Record the response time
	duration := time.Since(start)
	responseTimeHistogram.Record(c, duration.Milliseconds())
}
