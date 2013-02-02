import pystache
import os

renderer = pystache.Renderer()

def render(template_file, args={}):
    path = os.path.join(os.path.dirname(__file__),template_file)

    return renderer.render_path(path, args)
    
