FROM apacheignite/ignite:2.15.0-jdk11

RUN addgroup -S nonroot \
    && adduser -S nonroot -G nonroot

USER nonroot

WORKDIR /opt/ignite

CMD "$IGNITE_HOME"/run.sh

EXPOSE 11211 47100 47500 49112
