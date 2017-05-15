FROM python:3.6-alpine
EXPOSE 5000
ADD static static
ADD templates templates
ADD requirements.txt requirements.txt
ADD server.py server.py
RUN apk add --update build-base gcc
RUN pip install -r ./requirements.txt
RUN apk del build-base gcc
ENTRYPOINT python ./server.py