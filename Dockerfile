# Use official Deno image
FROM denoland/deno:2.4.5

WORKDIR /app

# Copy project files
COPY . .

# Expose port (change if your app uses a different port)
EXPOSE 3000

# Run the main entry point (replace with your actual entry file if different)
CMD ["run", "--allow-net", "--allow-read", "--allow-env", "--unstable-kv", "main.tsx"]
