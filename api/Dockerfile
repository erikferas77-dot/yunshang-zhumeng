FROM ghcr.io/berriai/litellm:main-latest

WORKDIR /app
COPY litellm_config.yaml /app/config.yaml

ENV PORT=8080
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/health/liveliness || exit 1

CMD ["--config", "/app/config.yaml", "--port", "8080", "--host", "0.0.0.0"]
