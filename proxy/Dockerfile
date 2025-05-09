FROM nginx:1.25-alpine

# Remove default config
RUN rm -f /etc/nginx/conf.d/default.conf

# Copy config files
COPY ./default.conf /etc/nginx/conf.d/
COPY ./uwsgi_params /etc/nginx/uwsgi_params

