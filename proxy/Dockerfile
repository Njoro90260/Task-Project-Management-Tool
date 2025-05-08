FROM nginx:1.25-alpine

# Switch to root for setup
USER root

# Create necessary directories with correct permissions
RUN mkdir -p /var/cache/nginx/client_temp && \
    chown -R nginx:nginx /var/cache/nginx && \
    chmod -R 755 /var/cache/nginx

# Remove default config
RUN rm -f /etc/nginx/conf.d/default.conf

# Copy config files
COPY ./default.conf /etc/nginx/conf.d/
COPY ./uwsgi_params /etc/nginx/uwsgi_params

# Create static volume directories
RUN mkdir -p /vol/static /vol/media && \
    chown -R nginx:nginx /vol && \
    chmod -R 755 /vol
