FROM python:3.12-slim

ENV PATH="/scripts:${PATH}:/app"
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Install system dependencies including sudo
RUN apt-get update && apt-get install -y \
    netcat-openbsd \
    gcc \
    postgresql-client \
    sudo \
    gosu \
    && pip install --upgrade pip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY ./requirements.txt /requirements.txt
RUN pip install -r /requirements.txt

# Create user with sudo privileges (for initial setup only)
RUN adduser --disabled-password --gecos '' user && \
    echo 'user ALL=(ALL) NOPASSWD: ALL' > /etc/sudoers.d/user && \
    chmod 0440 /etc/sudoers.d/user

# Create directories with correct ownership
RUN mkdir -p /vol/static /vol/media /var/log/uwsgi && \
    chown -R user:user /vol/static /vol/media /var/log/uwsgi && \
    chmod -R 775 /vol/static /vol/media && \
    chmod -R 777 /var/log/uwsgi

# Copy application files
COPY ./app /app
COPY ./scripts/entrypoint.sh /scripts/entrypoint.sh
RUN chmod +x /scripts/entrypoint.sh

WORKDIR /app

# Start as root (entrypoint will drop privileges)
CMD ["entrypoint.sh"]