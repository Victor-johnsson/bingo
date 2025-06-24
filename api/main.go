package main

import (
	"bingo/otelx"
	"context"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"bingo/board"
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

	boards := map[string]*board.Board{}

	// Ping test
	r.GET("/ping", func(c *gin.Context) {
		// _, span := tracer.Start(c.Request.Context(), "ping")
		// defer span.End()
		c.String(http.StatusOK, "pong")
	})

	r.GET("/board/:name", func(c *gin.Context) {
		name := c.Params.ByName("name")

		theBoard := boards[name]
		if theBoard == nil {

			theBoard := board.NewBoard(name)
            boards[name] = theBoard
		}
		c.JSON(http.StatusOK, theBoard)

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

func ginMetricHandle(c context.Context, start time.Time) {
	// set request total
	metricRequestTotal.Add(c, 1)

	// Record the response time
	duration := time.Since(start)
	responseTimeHistogram.Record(c, duration.Milliseconds())
}
