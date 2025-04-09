FROM python:3.10-slim

ENV PATH="/scripts:${PATH}"
ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        gcc \
        libc-dev \
        libpq-dev \
        python3-dev \
        build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY ./requirements.txt /requirements.txt
RUN pip install --upgrade pip \
     && pip install -r requirements.txt


# create app directory and copy files
RUN mkdir /app
COPY . /app
WORKDIR /app

# copy scripts and make them executable.
COPY ./scripts /scripts
RUN chmod +x /scripts/*

# create static media and folders
RUN mkdir -p /vol/web/media
RUN mkdir -p /vol/web/static

# create user and fix permissions
RUN adduser --disabled-password --no-create-home user \
    && chown -R user:user /vol \
    && chmod -R 755 /vol/web

USER user 

# Default command
CMD ["entrypoint.sh"]