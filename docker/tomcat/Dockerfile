# Tomcat 11 is required for Grails 8 (Servlet 6.1). The jdk25 tag matches `majorJavaVersion=25` in
# gradle.properties - keep these in sync. Production apps may prefer a pinned versioned tag
# (e.g. xhio/xh-tomcat:4.2.1-tc11-jdk25) over `latest` for repeatable builds.
FROM xhio/xh-tomcat:latest-tc11-jdk25
COPY setenv.sh bin/
COPY *.war webapps/ROOT.war
