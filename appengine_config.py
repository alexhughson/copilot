__author__ = 'alex'

from lib.gaesessions import SessionMiddleware

def webapp_add_wsgi_middleware(app):
    app = SessionMiddleware(app,
        cookie_key="sthasingsthrc438gyiiuu9u908009880cgsaxuecgkfgxcgrbvwmaaiofgrcgeonththvwmamidndiupntheoethwmthieognt@/CAPITALSPENISpenisP3N15")
    return app