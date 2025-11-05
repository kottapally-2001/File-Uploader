// src/middlewares/errors.js
function notFound(req, res, next) {
  res.status(404).render('404', { title: 'Not Found' });
}

function errorHandler(err, req, res, next) {
  console.error('❌ Error:', err);
  req.flash('error', err.message || 'Something went wrong.');
  res.status(500).redirect('back');
}

module.exports = { notFound, errorHandler };
