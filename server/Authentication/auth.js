function isAdmin(req, res, next) {
  if (req.session.userId && req.session.userType === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access required' });
  }
}

//GIA USERS ONLY
function isAuthenticated(req, res, next) {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ message: 'Please login' });
  }
}

function isBand(req, res, next) {
  if (req.session.userId && req.session.userType === 'band') {
    next();
  } else {
    res.status(403).json({ message: 'Band access required' });
  }
}

module.exports = { isAdmin, isAuthenticated, isBand };