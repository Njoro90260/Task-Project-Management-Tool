FROM nginxinc/nginx-unprivileged:1.25-alpine

# Remove default config (works with unprivileged image)
RUN rm /etc/nginx/conf.d/default.conf

# Copy config files
COPY ./default.conf /etc/nginx/conf.d/
COPY ./uwsgi_params /etc/nginx/

# Create static volume directory with correct permissions
RUN mkdir -p /vol/static && \
    chown nginx:nginx /vol/static && \
    chmod 755 /vol/static

# Switch to nginx user for runtime
USER nginx

EXPOSE 8080