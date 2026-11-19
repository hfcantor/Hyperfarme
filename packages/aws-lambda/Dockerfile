# AWS Lambda container image. Build from the repository root:
#   docker build -f packages/aws-lambda/Dockerfile -t hfr-lambda .
# Push to ECR and create the function with: memory 10240 MB, timeout 900 s, ephemeral storage 4096 MB.

# --- Stage 1: the Lambda runtime interface client compiles native code (curl + aws-lambda-cpp).
FROM node:22-bookworm-slim AS ric
RUN apt-get update \
 && apt-get install -y --no-install-recommends g++ make cmake autoconf automake libtool unzip python3 libcurl4-openssl-dev \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /opt/ric
RUN npm init -y >/dev/null && npm install --omit=dev aws-lambda-ric@3.3.0

# --- Stage 2: runtime image (no compilers).
FROM node:22-bookworm-slim

RUN apt-get update \
 && apt-get install -y --no-install-recommends ffmpeg ca-certificates fonts-dejavu-core libcurl4 \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /var/task
# The browser location must be the same at install time and at run time.
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
COPY package.json package-lock.json tsconfig.json ./
COPY packages ./packages
RUN npm ci --omit=dev --workspaces --include-workspace-root \
 && npx playwright-core install --with-deps chromium
COPY --from=ric /opt/ric/node_modules /opt/ric/node_modules

# Lambda only allows writes to /tmp: keep HOME and caches there
ENV HOME=/tmp HFR_CACHE_DIR=/tmp/hfr-cache
ENTRYPOINT ["node", "/opt/ric/node_modules/aws-lambda-ric/bin/index.mjs"]
CMD ["packages/aws-lambda/src/lambda.handler"]
