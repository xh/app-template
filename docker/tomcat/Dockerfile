# Tomcat 10 is required for Grails 7's Jakarta EE namespace migration. The jdk21 tag matches
# `majorJavaVersion=21` in gradle.properties -- keep these in sync. Production apps may prefer
# a pinned versioned tag (e.g. xhio/xh-tomcat:v1.2.3-tc10-jdk21) over `latest` for repeatable builds.
FROM xhio/xh-tomcat:latest-tc10-jdk21
COPY setenv.sh bin/
COPY *.war webapps/ROOT.war
