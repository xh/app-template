# Sets default JVM Xmx (max heap) of 1GB, unless overridden by optional JAVA_XMX env var.
export JAVA_OPTS="$JAVA_OPTS -Xmx${JAVA_XMX:-1G}"
