FROM python:3.10-slim

ENV PATH="/scripts:${PATH}"
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Install system dependencies    
RUN apt-get update && apt-get install -y \
    netcat-openbsd \
    gcc \
    postgresql-client \
    && pip install --upgrade pip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*


# Install Python dependencies
COPY ./requirements.txt /requirements.txt
RUN pip install -r /requirements.txt

# Create app directory and copy files
RUN mkdir /app
COPY ./ /app
WORKDIR /app

# # Copy scripts and make them executable
# COPY ./scripts /scripts
# RUN chmod +x /scripts/*

COPY scripts/entrypoint.sh /scripts/entrypoint.sh
RUN chmod +x /scripts/entrypoint.sh

# Create static and media folders
RUN mkdir -p /vol/web/media /vol/web/static

# Create non-root user and fix permissions
RUN adduser --disabled-password --no-create-home user \
    && chown -R user:user /vol \
    && chmod -R 755 /vol/web

USER user

CMD ["entrypoint.sh"]
