# Sets default JVM Xmx (max heap) of 2GB, unless overridden by optional JAVA_XMX env var.
export JAVA_OPTS="$JAVA_OPTS -Xmx${JAVA_XMX:-2G}"
