import mongoose from 'mongoose';

const shipmentSchema = new mongoose.Schema({
  // Tracking System
  trackingNumber: { 
    type: String, 
    unique: true, 
    required: true,
    index: true  // For fast lookups
  },
  
  // Shipment Details
  sender: {
    name: String,
    email: String,
    phone: String,
    address: String
  },
  
  receiver: {
    name: String,
    email: String,
    phone: String,
    address: String
  },
  
  // Package Info
  weight: Number,
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  description: String,
  
  // Real-Time Status
  status: { 
    type: String, 
    enum: [
      'pending',           // Order created
      'picked_up',         // Driver collected package
      'at_warehouse',      // Arrived at sorting facility
      'in_transit',        // On the way to destination
      'out_for_delivery',  // With delivery driver
      'delivered',         // Successfully delivered
      'failed_delivery',   // Delivery attempt failed
      'returned',          // Returned to sender
      'cancelled'          // Order cancelled
    ],
    default: 'pending'
  },
  
  // Status History (Timeline)
  statusHistory: [{
    status: String,
    location: {
      lat: Number,
      lng: Number,
      address: String,
      city: String,
      country: String
    },
    timestamp: { type: Date, default: Date.now },
    updatedBy: String, // Admin/Driver name
    notes: String,
    signature: String // For proof of delivery
  }],
  
  // Current Location (GPS)
  currentLocation: {
    lat: Number,
    lng: Number,
    address: String,
    lastUpdated: Date
  },
  
  // Pricing
  shippingCost: Number,
  insuranceCost: Number,
  customsFee: Number,
  totalCost: Number,
  
  // Payment
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  paymentMethod: String, // 'stripe', 'paypal', 'cash'
  paymentIntentId: String, // Stripe payment ID
  
  // Delivery Info
  estimatedDeliveryDate: Date,
  actualDeliveryDate: Date,
  deliveryProof: {
    signature: String,
    photo: String,
    recipientName: String
  },
  
  // Warehouse
  assignedWarehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse'
  },
  
  // Driver Assignment
  assignedDriver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Invoice
  invoiceNumber: String,
  invoiceUrl: String,
  
  // Customer Portal
  customerPortalAccess: {
    token: String, // For trackless tracking link
    expiresAt: Date
  }
  
}, { 
  timestamps: true // Adds createdAt and updatedAt
});

// Generate tracking number automatically
shipmentSchema.pre('save', async function(next) {
  if (!this.trackingNumber) {
    this.trackingNumber = await generateTrackingNumber();
  }
  next();
});

async function generateTrackingNumber() {
  const prefix = 'CJS'; // Clean J Shipping
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  
  // Get count of shipments today
  const startOfDay = new Date(date.setHours(0,0,0,0));
  const count = await mongoose.model('Shipment').countDocuments({
    createdAt: { $gte: startOfDay }
  });
  
  const sequence = String(count + 1).padStart(5, '0');
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  
  return `${prefix}${year}${month}${sequence}${random}`;
  // Example: CJS2511000017KFG
}

const Shipment = mongoose.model('Shipment', shipmentSchema);

export default Shipment;
