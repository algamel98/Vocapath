#!/usr/bin/env python3
"""
VocaPath Local Development Server
Serves the application on http://localhost:3001/vocapath
"""

import http.server
import socketserver
import os
import sys
from urllib.parse import unquote

PORT = 3001
BASE_PATH = "/vocapath"

class VocaPathHandler(http.server.SimpleHTTPRequestHandler):
    """Custom handler for VocaPath with base path support"""
    
    def do_GET(self):
        # Remove base path from URL
        path = self.path
        if path.startswith(BASE_PATH):
            path = path[len(BASE_PATH):]
        
        # Default to index.html for root
        if path == '/' or path == '':
            path = '/index.html'
        
        # Remove query strings
        path = path.split('?')[0]
        
        # Security: prevent directory traversal
        path = unquote(path)
        if '..' in path:
            self.send_error(403, "Forbidden")
            return
        
        # Update the path
        self.path = path
        
        # Try to serve the file
        try:
            return http.server.SimpleHTTPRequestHandler.do_GET(self)
        except Exception as e:
            # If file not found, serve index.html for SPA routing
            self.path = '/index.html'
            return http.server.SimpleHTTPRequestHandler.do_GET(self)
    
    def end_headers(self):
        # Disable caching for development
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        http.server.SimpleHTTPRequestHandler.end_headers(self)
    
    def log_message(self, format, *args):
        # Custom log format
        sys.stdout.write("%s - [%s] %s\n" %
                         (self.address_string(),
                          self.log_date_time_string(),
                          format % args))

def main():
    # Change to script directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # Create server
    with socketserver.TCPServer(("", PORT), VocaPathHandler) as httpd:
        print("=" * 60)
        print("                    VocaPath Server                     ")
        print("=" * 60)
        print(f"  Server running at: http://localhost:{PORT}{BASE_PATH}")
        print("  Press Ctrl+C to stop the server")
        print("=" * 60)
        print()
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\nShutting down server...")
            httpd.shutdown()
            print("Server closed")

if __name__ == "__main__":
    main()
