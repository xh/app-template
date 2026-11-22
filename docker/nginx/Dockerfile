# Production apps are recommended to use the most recent versioned build (e.g. 3.5.0-brotli), to
# ensure the source image remains stable and predictable across builds of the same app codebase.
# The brotli variant serves the pre-compressed `.br` files that the client build emits.
FROM xhio/xh-nginx:latest-brotli
COPY app.conf $XH_NGINX_CONFIG_PATH/
COPY build/ $XH_NGINX_CONTENT_PATH/
