#!/bin/bash
set -e

echo "Initializing Docker volumes..."

# Create volumes if they don't exist
docker volume create static_volume || true
docker volume create media_volume || true

# Set permissions (alpine image is small and perfect for this)
echo "Setting permissions..."
docker run --rm -v static_volume:/vol/static -v media_volume:/vol/media alpine \
  sh -c "mkdir -p /vol/static /vol/media && chown -R 1000:1000 /vol/static /vol/media && chmod -R 775 /vol/static /vol/media"

echo "Volume initialization complete!"