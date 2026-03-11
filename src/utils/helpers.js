


const generateOrderNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD${year}${month}${random}`;
};

const generateTaskNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `TSK${year}${month}${random}`;
};

const calculateTotalPrice = (pricePerDay, squareMeters, days) => {
  return pricePerDay * squareMeters * days;
};

const formatCurrency = (amount, currency = 'ETB') => {
  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const formatDate = (date, format = 'medium') => {
  const options = {
    short: { month: 'numeric', day: 'numeric', year: '2-digit' },
    medium: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { month: 'long', day: 'numeric', year: 'numeric' },
    full: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
  };
  
  return new Date(date).toLocaleDateString('en-US', options[format]);
};

const getOrderStatusColor = (status) => {
  const colors = {
    pending: 'warning',
    confirmed: 'info',
    assigned: 'primary',
    'in-progress': 'secondary',
    completed: 'success',
    cancelled: 'danger'
  };
  return colors[status] || 'default';
};

const getTaskStatusColor = (status) => {
  const colors = {
    pending: 'warning',
    'in-progress': 'info',
    completed: 'success',
    cancelled: 'danger'
  };
  return colors[status] || 'default';
};

const paginateResults = (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return { skip, limit: parseInt(limit), page: parseInt(page) };
};

const buildFilterQuery = (filters) => {
  const query = {};
  
  if (filters.status) query.status = filters.status;
  if (filters.customer) query.customer = filters.customer;
  if (filters.ledType) query.ledType = filters.ledType;
  if (filters.category) query.ledCategory = filters.category;
  
  if (filters.startDate || filters.endDate) {
    query.programDate = {};
    if (filters.startDate) query.programDate.$gte = new Date(filters.startDate);
    if (filters.endDate) query.programDate.$lte = new Date(filters.endDate);
  }
  
  if (filters.minPrice || filters.maxPrice) {
    query.totalPrice = {};
    if (filters.minPrice) query.totalPrice.$gte = filters.minPrice;
    if (filters.maxPrice) query.totalPrice.$lte = filters.maxPrice;
  }
  
  return query;
};

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validatePhone = (phone) => {
  const re = /^(\+251|0)?9\d{8}$/;
  return re.test(phone);
};

module.exports = {
  generateOrderNumber,
  generateTaskNumber,
  calculateTotalPrice,
  formatCurrency,
  formatDate,
  getOrderStatusColor,
  getTaskStatusColor,
  paginateResults,
  buildFilterQuery,
  validateEmail,
  validatePhone
};