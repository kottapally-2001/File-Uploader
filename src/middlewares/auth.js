function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  req.flash('error', 'Please log in to view that page');
  return res.redirect('/login');
}

function forwardAuthenticated(req, res, next) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return next();
  }
  return res.redirect('/dashboard');
}

module.exports = { ensureAuthenticated, forwardAuthenticated };
