import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';

const MONGO_URL = process.env.MONGO_URL;
const DB_NAME = process.env.DB_NAME || 'helper4u';

let cachedClient = null;
async function getDb() {
  if (!cachedClient) {
    cachedClient = new MongoClient(MONGO_URL);
    await cachedClient.connect();
  }
  return cachedClient.db(DB_NAME);
}

const SEED_HELPERS = [
  { name: 'Priya Sharma', service_type: 'nanny', experience: 8, city: 'Mumbai', bio: 'Warm, experienced caregiver with certification in early childhood care. Loves reading stories and cooking healthy meals for kids.', skills: ['Childcare','Cooking','First Aid','Storytelling'], languages:['English','Hindi','Marathi'], availability:'Full-time', verified:true, rating:4.8, reviews_count:42, hourly_price:350, monthly_price:22000, yearly_price:240000, photo:'https://images.pexels.com/photos/8954794/pexels-photo-8954794.jpeg' },
  { name: 'Anita Verma', service_type: 'maid', experience: 5, city: 'Delhi', bio: 'Reliable and thorough housekeeper. Specializes in deep cleaning, laundry, and organizing.', skills:['Cleaning','Laundry','Dishwashing','Organizing'], languages:['Hindi','English'], availability:'Part-time', verified:true, rating:4.6, reviews_count:28, hourly_price:250, monthly_price:15000, yearly_price:160000, photo:'https://images.unsplash.com/photo-1647381518264-97ff1835026f' },
  { name: 'Meena Iyer', service_type: 'babysitter', experience: 3, city: 'Bengaluru', bio: 'Fun-loving babysitter, great with toddlers. CPR certified and patient.', skills:['Babysitting','Homework help','CPR','Games'], languages:['English','Tamil','Kannada'], availability:'Evenings & Weekends', verified:true, rating:4.9, reviews_count:19, hourly_price:400, monthly_price:18000, yearly_price:200000, photo:'https://images.pexels.com/photos/6951492/pexels-photo-6951492.jpeg' },
  { name: 'Sunita Devi', service_type: 'maid', experience: 12, city: 'Mumbai', bio: 'Over a decade of trusted household service. Efficient and honest.', skills:['Cleaning','Cooking','Ironing'], languages:['Hindi'], availability:'Full-time', verified:true, rating:4.7, reviews_count:65, hourly_price:280, monthly_price:17000, yearly_price:180000, photo:'https://images.unsplash.com/photo-1644056347416-8180f2548fc1' },
  { name: 'Rekha Nair', service_type: 'nanny', experience: 6, city: 'Bengaluru', bio: 'Loving nanny with a background in nursing. Perfect for newborns and infants.', skills:['Newborn care','Feeding','Bathing','Nursing'], languages:['English','Malayalam','Hindi'], availability:'Live-in', verified:true, rating:4.9, reviews_count:37, hourly_price:450, monthly_price:28000, yearly_price:300000, photo:'https://images.pexels.com/photos/6974747/pexels-photo-6974747.jpeg' },
  { name: 'Kavita Patil', service_type: 'babysitter', experience: 2, city: 'Pune', bio: 'Energetic young babysitter, great with school-aged kids and homework help.', skills:['Homework help','Playtime','Arts & Crafts'], languages:['English','Marathi','Hindi'], availability:'Weekdays', verified:false, rating:4.4, reviews_count:8, hourly_price:300, monthly_price:14000, yearly_price:150000, photo:'https://images.unsplash.com/photo-1758272421751-963195322eaa' },
  { name: 'Lakshmi Rao', service_type: 'maid', experience: 7, city: 'Hyderabad', bio: 'Great cook specializing in South Indian cuisine. Also handles cleaning and laundry.', skills:['Cooking','Cleaning','Laundry'], languages:['Telugu','Hindi','English'], availability:'Full-time', verified:true, rating:4.8, reviews_count:51, hourly_price:320, monthly_price:19000, yearly_price:210000, photo:'https://images.unsplash.com/photo-1647381518264-97ff1835026f' },
  { name: 'Fatima Khan', service_type: 'nanny', experience: 10, city: 'Delhi', bio: 'Experienced nanny with excellent references. Fluent in English, great for bilingual homes.', skills:['Childcare','English tutoring','Cooking','Discipline'], languages:['English','Urdu','Hindi'], availability:'Full-time', verified:true, rating:4.9, reviews_count:73, hourly_price:500, monthly_price:32000, yearly_price:350000, photo:'https://images.pexels.com/photos/8954794/pexels-photo-8954794.jpeg' }
];

async function ensureSeed(db) {
  const count = await db.collection('helpers').countDocuments();
  if (count === 0) {
    const docs = SEED_HELPERS.map(h => ({ id: uuidv4(), ...h, created_at: new Date().toISOString() }));
    await db.collection('helpers').insertMany(docs);
  }
  const adminCount = await db.collection('users').countDocuments({ role: 'admin' });
  if (adminCount === 0) {
    await db.collection('users').insertOne({ id: uuidv4(), name:'Admin', email:'admin@helper4u.com', password:'admin123', role:'admin', created_at:new Date().toISOString() });
  }
}

function json(data, status=200) { return NextResponse.json(data, { status }); }

async function handle(request, { params }) {
  const db = await getDb();
  await ensureSeed(db);
  const method = request.method;
  const pathArr = (await params)?.path || [];
  const route = '/' + pathArr.join('/');
  const url = new URL(request.url);

  try {
    // Health
    if (route === '/' || route === '/health') return json({ status:'ok', service:'helper4u' });

    // AUTH
    if (route === '/auth/register' && method === 'POST') {
      const body = await request.json();
      const { name, email, password, role, phone, city } = body;
      if (!name || !email || !password || !role) return json({ error:'Missing fields' }, 400);
      const existing = await db.collection('users').findOne({ email });
      if (existing) return json({ error:'Email already registered' }, 400);
      const user = { id: uuidv4(), name, email, password, role, phone: phone||'', city: city||'', created_at: new Date().toISOString() };
      await db.collection('users').insertOne(user);
      // If helper, create helper profile
      if (role === 'helper') {
        const helperProfile = {
          id: uuidv4(), user_id: user.id, name, city: city||'', service_type: body.service_type||'maid',
          experience: Number(body.experience||0), bio: body.bio||'', skills: body.skills||[], languages: body.languages||[],
          availability: body.availability||'Full-time', verified:false, rating:0, reviews_count:0,
          hourly_price: Number(body.hourly_price||300), monthly_price: Number(body.monthly_price||15000), yearly_price: Number(body.yearly_price||150000),
          photo: body.photo||'https://images.unsplash.com/photo-1647381518264-97ff1835026f', created_at: new Date().toISOString()
        };
        await db.collection('helpers').insertOne(helperProfile);
      }
      const { password: _, ...safe } = user;
      return json({ user: safe });
    }

    if (route === '/auth/login' && method === 'POST') {
      const { email, password } = await request.json();
      const user = await db.collection('users').findOne({ email, password });
      if (!user) return json({ error:'Invalid credentials' }, 401);
      const { password: _, _id, ...safe } = user;
      return json({ user: safe });
    }

    // HELPERS
    if (route === '/helpers' && method === 'GET') {
      const service = url.searchParams.get('service');
      const city = url.searchParams.get('city');
      const q = url.searchParams.get('q');
      const minExp = url.searchParams.get('minExp');
      const availability = url.searchParams.get('availability');
      const verifiedOnly = url.searchParams.get('verifiedOnly');
      const plan = url.searchParams.get('plan'); // hourly|monthly|yearly
      const query = {};
      if (service && service !== 'all') query.service_type = service;
      if (city && city !== 'all') query.city = city;
      if (availability && availability !== 'all') query.availability = availability;
      if (minExp) query.experience = { $gte: Number(minExp) };
      if (verifiedOnly === 'true') query.verified = true;
      if (q) query.name = { $regex: q, $options: 'i' };
      let helpers = await db.collection('helpers').find(query).sort({ verified:-1, rating:-1 }).toArray();
      if (plan && plan !== 'all') {
        // Only include helpers that have pricing for the plan
        helpers = helpers.filter(h => h[plan+'_price'] && h[plan+'_price'] > 0);
      }
      return json({ helpers: helpers.map(({ _id, ...h }) => h) });
    }

    if (route.startsWith('/helpers/') && method === 'GET') {
      const id = pathArr[1];
      const helper = await db.collection('helpers').findOne({ id });
      if (!helper) return json({ error:'Not found' }, 404);
      const { _id, ...rest } = helper;
      const reviews = await db.collection('reviews').find({ helper_id:id }).sort({ created_at:-1 }).toArray();
      return json({ helper: rest, reviews: reviews.map(({_id,...r})=>r) });
    }

    if (route.startsWith('/helpers/') && method === 'PATCH') {
      const id = pathArr[1];
      const body = await request.json();
      delete body.id; delete body._id;
      await db.collection('helpers').updateOne({ id }, { $set: body });
      const helper = await db.collection('helpers').findOne({ id });
      const { _id, ...rest } = helper;
      return json({ helper: rest });
    }

    // BOOKINGS
    if (route === '/bookings' && method === 'POST') {
      const body = await request.json();
      const booking = {
        id: uuidv4(),
        user_id: body.user_id,
        user_name: body.user_name,
        user_email: body.user_email,
        helper_id: body.helper_id,
        helper_name: body.helper_name,
        plan: body.plan, // hourly|monthly|yearly
        price: body.price,
        start_date: body.start_date,
        hours: body.hours || null,
        address: body.address || '',
        notes: body.notes || '',
        status: 'pending', // pending|accepted|rejected|completed|cancelled
        created_at: new Date().toISOString()
      };
      await db.collection('bookings').insertOne(booking);
      const { _id, ...safe } = booking;
      return json({ booking: safe });
    }

    if (route === '/bookings' && method === 'GET') {
      const user_id = url.searchParams.get('user_id');
      const helper_id = url.searchParams.get('helper_id');
      const all = url.searchParams.get('all');
      const query = {};
      if (user_id) query.user_id = user_id;
      if (helper_id) query.helper_id = helper_id;
      const bookings = await db.collection('bookings').find(all==='true'?{}:query).sort({ created_at:-1 }).toArray();
      return json({ bookings: bookings.map(({_id,...b})=>b) });
    }

    if (route.startsWith('/bookings/') && method === 'PATCH') {
      const id = pathArr[1];
      const { status } = await request.json();
      await db.collection('bookings').updateOne({ id }, { $set: { status } });
      const booking = await db.collection('bookings').findOne({ id });
      const { _id, ...safe } = booking;
      return json({ booking: safe });
    }

    // REVIEWS
    if (route === '/reviews' && method === 'POST') {
      const body = await request.json();
      const review = { id: uuidv4(), helper_id: body.helper_id, user_id: body.user_id, user_name: body.user_name, rating: Number(body.rating), comment: body.comment||'', created_at: new Date().toISOString() };
      await db.collection('reviews').insertOne(review);
      // Update helper rating
      const all = await db.collection('reviews').find({ helper_id: body.helper_id }).toArray();
      const avg = all.reduce((s,r)=>s+r.rating,0)/all.length;
      await db.collection('helpers').updateOne({ id: body.helper_id }, { $set: { rating: Math.round(avg*10)/10, reviews_count: all.length } });
      const { _id, ...safe } = review;
      return json({ review: safe });
    }

    // ADMIN
    if (route === '/admin/stats' && method === 'GET') {
      const users = await db.collection('users').countDocuments({ role:'household' });
      const helpers = await db.collection('helpers').countDocuments();
      const verifiedHelpers = await db.collection('helpers').countDocuments({ verified:true });
      const bookings = await db.collection('bookings').countDocuments();
      const pending = await db.collection('bookings').countDocuments({ status:'pending' });
      const cancelled = await db.collection('bookings').countDocuments({ status:'cancelled' });
      const completed = await db.collection('bookings').countDocuments({ status:'completed' });
      const complaints = await db.collection('complaints').countDocuments();
      const openComplaints = await db.collection('complaints').countDocuments({ status:'open' });
      return json({ users, helpers, verifiedHelpers, bookings, pending, cancelled, completed, complaints, openComplaints });
    }

    if (route === '/admin/users' && method === 'GET') {
      const users = await db.collection('users').find({}).sort({ created_at:-1 }).toArray();
      return json({ users: users.map(({ _id, password, ...u }) => u) });
    }

    if (route.startsWith('/admin/users/') && method === 'DELETE') {
      const id = pathArr[2];
      await db.collection('users').deleteOne({ id });
      return json({ ok:true });
    }

    if (route === '/admin/helpers' && method === 'GET') {
      const helpers = await db.collection('helpers').find({}).sort({ verified:1, created_at:-1 }).toArray();
      return json({ helpers: helpers.map(({_id,...h})=>h) });
    }

    // USER PROFILE (household edit)
    if (route.startsWith('/users/') && method === 'PATCH') {
      const id = pathArr[1];
      const body = await request.json();
      delete body.id; delete body._id; delete body.role; delete body.password;
      await db.collection('users').updateOne({ id }, { $set: body });
      const u = await db.collection('users').findOne({ id });
      const { _id, password, ...safe } = u;
      return json({ user: safe });
    }

    // ATTENDANCE - helper marks presence for a booking date
    if (route === '/attendance' && method === 'POST') {
      const body = await request.json();
      const rec = { id: uuidv4(), booking_id: body.booking_id, helper_id: body.helper_id, helper_name: body.helper_name, user_id: body.user_id, date: body.date || new Date().toISOString().slice(0,10), status: body.status || 'present', notes: body.notes||'', created_at: new Date().toISOString() };
      await db.collection('attendance').insertOne(rec);
      const { _id, ...safe } = rec;
      return json({ attendance: safe });
    }
    if (route === '/attendance' && method === 'GET') {
      const booking_id = url.searchParams.get('booking_id');
      const helper_id = url.searchParams.get('helper_id');
      const all = url.searchParams.get('all');
      const q = all==='true' ? {} : booking_id ? { booking_id } : helper_id ? { helper_id } : {};
      const items = await db.collection('attendance').find(q).sort({ date:-1 }).toArray();
      return json({ attendance: items.map(({_id,...a})=>a) });
    }

    // SERVICE CATEGORIES
    if (route === '/categories' && method === 'GET') {
      let cats = await db.collection('categories').find({}).toArray();
      if (cats.length === 0) {
        const defaults = [
          { id: uuidv4(), name:'Maid', slug:'maid', icon:'🧹', description:'Cleaning, cooking, laundry', active:true },
          { id: uuidv4(), name:'Nanny', slug:'nanny', icon:'👶', description:'Childcare & nurturing', active:true },
          { id: uuidv4(), name:'Babysitter', slug:'babysitter', icon:'🍼', description:'Short-term child supervision', active:true },
        ];
        await db.collection('categories').insertMany(defaults);
        cats = defaults;
      }
      return json({ categories: cats.map(({_id,...c})=>c) });
    }
    if (route === '/categories' && method === 'POST') {
      const body = await request.json();
      const cat = { id: uuidv4(), name: body.name, slug: body.slug||body.name.toLowerCase(), icon: body.icon||'✨', description: body.description||'', active: true };
      await db.collection('categories').insertOne(cat);
      const { _id, ...safe } = cat;
      return json({ category: safe });
    }
    if (route.startsWith('/categories/') && method === 'PATCH') {
      const id = pathArr[1];
      const body = await request.json();
      await db.collection('categories').updateOne({ id }, { $set: body });
      return json({ ok:true });
    }
    if (route.startsWith('/categories/') && method === 'DELETE') {
      const id = pathArr[1];
      await db.collection('categories').deleteOne({ id });
      return json({ ok:true });
    }

    // ANALYTICS - richer report
    if (route === '/admin/analytics' && method === 'GET') {
      const bookings = await db.collection('bookings').find({}).toArray();
      const helpers = await db.collection('helpers').find({}).toArray();
      const users = await db.collection('users').find({}).toArray();
      // Booking status breakdown
      const statusCounts = ['pending','accepted','rejected','completed','cancelled'].map(s => ({ name:s, value: bookings.filter(b=>b.status===s).length }));
      // Plan distribution
      const planCounts = ['hourly','monthly','yearly'].map(p => ({ name:p, value: bookings.filter(b=>b.plan===p).length }));
      // Service type distribution
      const serviceCounts = ['maid','nanny','babysitter'].map(s => ({ name:s, value: helpers.filter(h=>h.service_type===s).length }));
      // Revenue by month (last 6 months)
      const now = new Date();
      const months = [];
      for (let i=5; i>=0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth()-i, 1);
        const label = d.toLocaleString('en',{month:'short'});
        const monthBookings = bookings.filter(b => {
          const bd = new Date(b.created_at);
          return bd.getMonth()===d.getMonth() && bd.getFullYear()===d.getFullYear() && (b.status==='accepted'||b.status==='completed');
        });
        const revenue = monthBookings.reduce((s,b)=>s+(b.price||0),0);
        months.push({ name: label, revenue, bookings: monthBookings.length });
      }
      // Top helpers by rating
      const topHelpers = helpers.slice().sort((a,b)=>(b.rating||0)-(a.rating||0)).slice(0,5).map(h=>({ name:h.name, rating:h.rating, reviews:h.reviews_count }));
      // Reliability score = completed / (completed + cancelled + rejected)
      const completionRate = bookings.length ? Math.round((bookings.filter(b=>b.status==='completed'||b.status==='accepted').length / bookings.length) * 100) : 0;
      // Avg satisfaction
      const rated = helpers.filter(h=>h.rating>0);
      const avgSatisfaction = rated.length ? (rated.reduce((s,h)=>s+h.rating,0)/rated.length).toFixed(1) : '0.0';
      // Monthly active users (bookings in last 30 days unique)
      const thirtyAgo = new Date(Date.now() - 30*24*60*60*1000);
      const mau = new Set(bookings.filter(b => new Date(b.created_at) >= thirtyAgo).map(b=>b.user_id)).size;
      const totalRevenue = bookings.filter(b=>b.status==='accepted'||b.status==='completed').reduce((s,b)=>s+(b.price||0),0);
      return json({ statusCounts, planCounts, serviceCounts, months, topHelpers, completionRate, avgSatisfaction, mau, totalRevenue });
    }

    // DOCUMENTS (helper verification uploads - store as base64 or URL strings)
    if (route === '/documents' && method === 'POST') {
      const body = await request.json();
      const doc = { id: uuidv4(), helper_id: body.helper_id, type: body.type, name: body.name, data: body.data, status:'pending', created_at: new Date().toISOString() };
      await db.collection('documents').insertOne(doc);
      const { _id, ...safe } = doc;
      return json({ document: safe });
    }
    if (route === '/documents' && method === 'GET') {
      const helper_id = url.searchParams.get('helper_id');
      const q = helper_id ? { helper_id } : {};
      const docs = await db.collection('documents').find(q).sort({ created_at:-1 }).toArray();
      return json({ documents: docs.map(({_id,...d})=>d) });
    }
    if (route.startsWith('/documents/') && method === 'PATCH') {
      const id = pathArr[1];
      const { status } = await request.json();
      await db.collection('documents').updateOne({ id }, { $set: { status } });
      return json({ ok:true });
    }
    if (route.startsWith('/documents/') && method === 'DELETE') {
      const id = pathArr[1];
      await db.collection('documents').deleteOne({ id });
      return json({ ok:true });
    }

    // COMPLAINTS / DISPUTES
    if (route === '/complaints' && method === 'POST') {
      const body = await request.json();
      const c = { id: uuidv4(), user_id: body.user_id, user_name: body.user_name, booking_id: body.booking_id||'', helper_id: body.helper_id||'', helper_name: body.helper_name||'', subject: body.subject, message: body.message, status:'open', admin_reply:'', created_at: new Date().toISOString() };
      await db.collection('complaints').insertOne(c);
      const { _id, ...safe } = c;
      return json({ complaint: safe });
    }
    if (route === '/complaints' && method === 'GET') {
      const user_id = url.searchParams.get('user_id');
      const all = url.searchParams.get('all');
      const q = all==='true' ? {} : (user_id ? { user_id } : {});
      const items = await db.collection('complaints').find(q).sort({ created_at:-1 }).toArray();
      return json({ complaints: items.map(({_id,...c})=>c) });
    }
    if (route.startsWith('/complaints/') && method === 'PATCH') {
      const id = pathArr[1];
      const body = await request.json();
      await db.collection('complaints').updateOne({ id }, { $set: body });
      return json({ ok:true });
    }

    return json({ error:'Not found', route, method }, 404);
  } catch (e) {
    console.error(e);
    return json({ error: e.message }, 500);
  }
}

export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const PUT = handle;
export const DELETE = handle;
