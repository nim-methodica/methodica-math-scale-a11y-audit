"""Threaded static file server for previewing the build folder.
Single-threaded http.server stalls the browser's parallel requests; this
ThreadingHTTPServer handles them concurrently and supports range requests
(needed for video seeking)."""
import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

PORT = 8123
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "build")


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


if __name__ == "__main__":
    httpd = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    httpd.serve_forever()
