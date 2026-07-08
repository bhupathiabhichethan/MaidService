'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Search, Shield, Star, MapPin, Briefcase, Clock, CheckCircle2, XCircle, LogIn, LogOut, UserPlus, Home, Heart, Sparkles, Users, Calendar, Menu, Filter, BadgeCheck, FileText, Upload, Trash2, MessageSquareWarning, Send, X, User, Edit, Plus, TrendingUp, Award, DollarSign } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const CITIES = ['Mumbai','Delhi','Bengaluru','Hyderabad','Pune','Chennai','Kolkata'];
const SERVICES = [
  { value:'maid', label:'Maid', icon:'🧹' },
  { value:'nanny', label:'Nanny', icon:'👶' },
  { value:'babysitter', label:'Babysitter', icon:'🍼' },
];
const AVAILABILITIES = ['Full-time','Part-time','Live-in','Weekdays','Evenings & Weekends'];

function useAuth() {
  const [user, setUser] = useState(null);
  useEffect(()=>{
    const raw = typeof window !== 'undefined' ? localStorage.getItem('h4u_user') : null;
    if (raw) setUser(JSON.parse(raw));
  },[]);
  const login = (u) => { localStorage.setItem('h4u_user', JSON.stringify(u)); setUser(u); };
  const logout = () => { localStorage.removeItem('h4u_user'); setUser(null); };
  return { user, login, logout };
}

function api(path, opts={}) {
  return fetch('/api'+path, { headers:{'Content-Type':'application/json'}, ...opts }).then(async r => {
    const data = await r.json();
    if (!r.ok) throw new Error(data.error||'Request failed');
    return data;
  });
}

function StarRow({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`h-4 w-4 ${i<=Math.round(rating)?'fill-amber-400 text-amber-400':'text-muted-foreground/30'}`} />
      ))}
    </div>
  );
}

function HelperCard({ helper, onClick }) {
  const service = SERVICES.find(s=>s.value===helper.service_type);
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border-border/60 hover:border-primary/40" onClick={onClick}>
      <div className="relative h-48 overflow-hidden bg-muted">
        <img src={helper.photo} alt={helper.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge className="bg-white/95 text-foreground hover:bg-white shadow-sm">{service?.icon} {service?.label}</Badge>
          {helper.verified && <Badge className="bg-emerald-600 hover:bg-emerald-700 shadow-sm"><BadgeCheck className="h-3 w-3 mr-1"/>Verified</Badge>}
        </div>
        <div className="absolute bottom-3 right-3 bg-white/95 rounded-full px-3 py-1 flex items-center gap-1 shadow-sm">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400"/>
          <span className="text-sm font-semibold">{helper.rating || 'New'}</span>
          <span className="text-xs text-muted-foreground">({helper.reviews_count})</span>
        </div>
      </div>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg leading-tight">{helper.name}</h3>
            <div className="flex items-center text-sm text-muted-foreground gap-2 mt-1">
              <MapPin className="h-3.5 w-3.5"/>{helper.city}
              <span>·</span>
              <Briefcase className="h-3.5 w-3.5"/>{helper.experience}y exp
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{helper.bio}</p>
        <div className="flex flex-wrap gap-1 pt-1">
          {helper.skills?.slice(0,3).map(s => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
        </div>
        <div className="flex items-baseline justify-between pt-2 border-t border-border/60 mt-2">
          <div>
            <span className="text-2xl font-bold text-primary">₹{helper.hourly_price}</span>
            <span className="text-sm text-muted-foreground">/hr</span>
          </div>
          <span className="text-xs text-muted-foreground">{helper.availability}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function AuthDialog({ open, onOpenChange, mode, setMode, onSuccess }) {
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'household', phone:'', city:'Mumbai', service_type:'maid', experience:0, bio:'', hourly_price:300, monthly_price:15000, yearly_price:150000, availability:'Full-time' });
  const [loading, setLoading] = useState(false);
  const submit = async () => {
    setLoading(true);
    try {
      const path = mode==='login' ? '/auth/login' : '/auth/register';
      const data = await api(path, { method:'POST', body: JSON.stringify(form) });
      toast.success(mode==='login'?'Welcome back!':'Account created!');
      onSuccess(data.user); onOpenChange(false);
    } catch (e) { toast.error(e.message); }
    setLoading(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode==='login'?'Welcome back':'Create your account'}</DialogTitle>
          <DialogDescription>{mode==='login'?'Log in to book helpers or manage your profile.':'Join Helper4U as a household or a helper.'}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {mode==='register' && (
            <div className="grid grid-cols-2 gap-2">
              <Button variant={form.role==='household'?'default':'outline'} onClick={()=>setForm({...form,role:'household'})}><Home className="h-4 w-4 mr-1"/>Household</Button>
              <Button variant={form.role==='helper'?'default':'outline'} onClick={()=>setForm({...form,role:'helper'})}><Heart className="h-4 w-4 mr-1"/>Helper</Button>
            </div>
          )}
          {mode==='register' && <div><Label>Full Name</Label><Input value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div>}
          <div><Label>Email</Label><Input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div>
          <div><Label>Password</Label><Input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></div>
          {mode==='register' && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Phone</Label><Input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></div>
                <div><Label>City</Label>
                  <Select value={form.city} onValueChange={v=>setForm({...form,city:v})}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>{CITIES.map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              {form.role==='helper' && (
                <>
                  <Separator/>
                  <div className="grid grid-cols-2 gap-2">
                    <div><Label>Service Type</Label>
                      <Select value={form.service_type} onValueChange={v=>setForm({...form,service_type:v})}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>{SERVICES.map(s=><SelectItem key={s.value} value={s.value}>{s.icon} {s.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div><Label>Experience (years)</Label><Input type="number" value={form.experience} onChange={e=>setForm({...form,experience:e.target.value})}/></div>
                  </div>
                  <div><Label>Availability</Label>
                    <Select value={form.availability} onValueChange={v=>setForm({...form,availability:v})}>
                      <SelectTrigger><SelectValue/></SelectTrigger>
                      <SelectContent>{AVAILABILITIES.map(a=><SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Bio</Label><Textarea rows={2} value={form.bio} onChange={e=>setForm({...form,bio:e.target.value})}/></div>
                  <div className="grid grid-cols-3 gap-2">
                    <div><Label>₹/hr</Label><Input type="number" value={form.hourly_price} onChange={e=>setForm({...form,hourly_price:e.target.value})}/></div>
                    <div><Label>₹/mo</Label><Input type="number" value={form.monthly_price} onChange={e=>setForm({...form,monthly_price:e.target.value})}/></div>
                    <div><Label>₹/yr</Label><Input type="number" value={form.yearly_price} onChange={e=>setForm({...form,yearly_price:e.target.value})}/></div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button className="w-full" onClick={submit} disabled={loading}>{loading?'Please wait...':(mode==='login'?'Log in':'Create account')}</Button>
          <button className="text-sm text-muted-foreground hover:text-primary" onClick={()=>setMode(mode==='login'?'register':'login')}>
            {mode==='login'?"Don't have an account? Sign up":'Already have an account? Log in'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BookingDialog({ helper, open, onOpenChange, user, onBooked }) {
  const [plan, setPlan] = useState('hourly');
  const [hours, setHours] = useState(4);
  const [date, setDate] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  if (!helper) return null;
  const priceMap = { hourly: helper.hourly_price * hours, monthly: helper.monthly_price, yearly: helper.yearly_price };
  const price = priceMap[plan];
  const submit = async () => {
    if (!user) { toast.error('Please log in first'); return; }
    setLoading(true);
    try {
      await api('/bookings', { method:'POST', body: JSON.stringify({
        user_id: user.id, user_name: user.name, user_email: user.email,
        helper_id: helper.id, helper_name: helper.name,
        plan, price, start_date: date, hours: plan==='hourly'?hours:null, address, notes
      })});
      toast.success('Booking request sent!');
      onBooked(); onOpenChange(false);
    } catch (e) { toast.error(e.message); }
    setLoading(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Book {helper.name}</DialogTitle>
          <DialogDescription>Choose a plan and share your details.</DialogDescription>
        </DialogHeader>
        <Tabs value={plan} onValueChange={setPlan}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="hourly">Hourly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
          </TabsList>
          <TabsContent value="hourly" className="space-y-3 pt-3">
            <div><Label>Hours</Label><Input type="number" min="1" value={hours} onChange={e=>setHours(Number(e.target.value))}/></div>
          </TabsContent>
          <TabsContent value="monthly" className="pt-3 text-sm text-muted-foreground">Full month of service at ₹{helper.monthly_price}/month.</TabsContent>
          <TabsContent value="yearly" className="pt-3 text-sm text-muted-foreground">Save more with yearly commitment at ₹{helper.yearly_price}/year.</TabsContent>
        </Tabs>
        <div className="space-y-3">
          <div><Label>Start Date</Label><Input type="date" value={date} onChange={e=>setDate(e.target.value)}/></div>
          <div><Label>Service Address</Label><Input value={address} onChange={e=>setAddress(e.target.value)} placeholder="House/Flat, Street, City"/></div>
          <div><Label>Notes (optional)</Label><Textarea rows={2} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Any special requirements..."/></div>
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-2xl font-bold text-primary">₹{price?.toLocaleString('en-IN')}</span>
          </div>
        </div>
        <DialogFooter>
          <Button className="w-full" onClick={submit} disabled={loading || !date || !address}>{loading?'Sending...':'Confirm Booking'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function HelperDetailSheet({ helper, open, onOpenChange, user, onBook }) {
  const [details, setDetails] = useState(null);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  useEffect(()=>{
    if (helper && open) {
      api('/helpers/'+helper.id).then(setDetails).catch(()=>{});
    }
  },[helper, open]);
  const submitReview = async () => {
    if (!user) { toast.error('Log in to leave a review'); return; }
    try {
      await api('/reviews', { method:'POST', body: JSON.stringify({ helper_id: helper.id, user_id: user.id, user_name: user.name, rating: reviewRating, comment: reviewText })});
      toast.success('Review posted!');
      setReviewText('');
      const d = await api('/helpers/'+helper.id);
      setDetails(d);
    } catch (e) { toast.error(e.message); }
  };
  if (!helper) return null;
  const service = SERVICES.find(s=>s.value===helper.service_type);
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="pb-2"><SheetTitle>Helper Profile</SheetTitle></SheetHeader>
        <div className="relative h-56 -mx-6 overflow-hidden rounded-lg">
          <img src={helper.photo} alt={helper.name} className="w-full h-full object-cover"/>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"/>
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-white/20 backdrop-blur border-white/30">{service?.icon} {service?.label}</Badge>
              {helper.verified && <Badge className="bg-emerald-600"><BadgeCheck className="h-3 w-3 mr-1"/>Verified</Badge>}
            </div>
            <h2 className="text-3xl font-bold">{helper.name}</h2>
            <div className="flex items-center gap-3 mt-1 text-sm">
              <div className="flex items-center gap-1"><MapPin className="h-4 w-4"/>{helper.city}</div>
              <div className="flex items-center gap-1"><Briefcase className="h-4 w-4"/>{helper.experience} years</div>
              <div className="flex items-center gap-1"><Star className="h-4 w-4 fill-amber-400 text-amber-400"/>{helper.rating} ({helper.reviews_count})</div>
            </div>
          </div>
        </div>
        <div className="py-4 space-y-5">
          <div>
            <h3 className="font-semibold mb-1">About</h3>
            <p className="text-sm text-muted-foreground">{helper.bio}</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {['hourly','monthly','yearly'].map(p => (
              <div key={p} className="border rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground uppercase">{p}</div>
                <div className="text-lg font-bold text-primary">₹{(helper[p+'_price']||0).toLocaleString('en-IN')}</div>
              </div>
            ))}
          </div>
          <div>
            <h3 className="font-semibold mb-2">Skills</h3>
            <div className="flex flex-wrap gap-1">{helper.skills?.map(s=><Badge key={s} variant="secondary">{s}</Badge>)}</div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Languages</h3>
            <div className="flex flex-wrap gap-1">{helper.languages?.map(s=><Badge key={s} variant="outline">{s}</Badge>)}</div>
          </div>
          <div className="flex items-center gap-2 text-sm"><Clock className="h-4 w-4 text-primary"/><strong>Availability:</strong> {helper.availability}</div>
          <Button className="w-full" size="lg" onClick={()=>onBook(helper)}>Book {helper.name}</Button>
          <Separator/>
          <div>
            <h3 className="font-semibold mb-3">Reviews ({details?.reviews?.length || 0})</h3>
            {user && (
              <div className="space-y-2 mb-4 bg-muted/40 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-sm">Your rating:</span>
                  {[1,2,3,4,5].map(i => (
                    <button key={i} onClick={()=>setReviewRating(i)}>
                      <Star className={`h-5 w-5 ${i<=reviewRating?'fill-amber-400 text-amber-400':'text-muted-foreground/40'}`}/>
                    </button>
                  ))}
                </div>
                <Textarea rows={2} placeholder="Share your experience..." value={reviewText} onChange={e=>setReviewText(e.target.value)}/>
                <Button size="sm" onClick={submitReview}>Post Review</Button>
              </div>
            )}
            <div className="space-y-3">
              {details?.reviews?.map(r => (
                <div key={r.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{r.user_name}</span>
                    <StarRow rating={r.rating}/>
                  </div>
                  <p className="text-sm text-muted-foreground">{r.comment}</p>
                </div>
              ))}
              {!details?.reviews?.length && <p className="text-sm text-muted-foreground">No reviews yet. Be the first!</p>}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ProfileEditor({ user, onUpdate }) {
  const [form, setForm] = useState({ name:user.name||'', phone:user.phone||'', city:user.city||'Mumbai', address: user.address||'', family_size: user.family_size||'', preferences: user.preferences||'' });
  const save = async () => {
    try {
      const d = await api('/users/'+user.id, { method:'PATCH', body: JSON.stringify(form) });
      onUpdate({ ...user, ...d.user });
      toast.success('Profile updated');
    } catch (e) { toast.error(e.message); }
  };
  return (
    <Card>
      <CardHeader><CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4"/>Household Profile</CardTitle><CardDescription>Keep your info up to date for smoother bookings.</CardDescription></CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div><Label>Full Name</Label><Input value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div>
          <div><Label>Phone</Label><Input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></div>
          <div><Label>City</Label>
            <Select value={form.city} onValueChange={v=>setForm({...form,city:v})}>
              <SelectTrigger><SelectValue/></SelectTrigger>
              <SelectContent>{CITIES.map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Family Size</Label><Input value={form.family_size} onChange={e=>setForm({...form,family_size:e.target.value})} placeholder="e.g. 2 adults, 1 kid"/></div>
          <div className="md:col-span-2"><Label>Home Address</Label><Input value={form.address} onChange={e=>setForm({...form,address:e.target.value})}/></div>
          <div className="md:col-span-2"><Label>Preferences / Special Needs</Label><Textarea rows={2} value={form.preferences} onChange={e=>setForm({...form,preferences:e.target.value})}/></div>
        </div>
        <Button onClick={save}><Edit className="h-4 w-4 mr-1"/>Save Profile</Button>
      </CardContent>
    </Card>
  );
}

function ComplaintDialog({ open, onOpenChange, user, booking, onSubmit }) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const submit = async () => {
    try {
      await api('/complaints', { method:'POST', body: JSON.stringify({
        user_id: user.id, user_name: user.name,
        booking_id: booking?.id||'', helper_id: booking?.helper_id||'', helper_name: booking?.helper_name||'',
        subject, message
      })});
      toast.success('Complaint submitted. Admin will review.');
      setSubject(''); setMessage('');
      onSubmit?.();
      onOpenChange(false);
    } catch (e) { toast.error(e.message); }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Raise a Complaint</DialogTitle>
          <DialogDescription>{booking ? `Regarding booking with ${booking.helper_name}` : 'Send us your concern'}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div><Label>Subject</Label><Input value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Brief summary"/></div>
          <div><Label>Details</Label><Textarea rows={4} value={message} onChange={e=>setMessage(e.target.value)} placeholder="Explain the issue..."/></div>
        </div>
        <DialogFooter><Button className="w-full" onClick={submit} disabled={!subject||!message}>Submit Complaint</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function UserDashboard({ user, onUpdateUser }) {
  const [bookings, setBookings] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [complaintOpen, setComplaintOpen] = useState(false);
  const [complaintBooking, setComplaintBooking] = useState(null);
  const load = async () => {
    const b = await api(`/bookings?user_id=${user.id}`); setBookings(b.bookings);
    const c = await api(`/complaints?user_id=${user.id}`); setComplaints(c.complaints);
  };
  useEffect(()=>{ load(); },[user]);
  const cancel = async (id) => {
    await api('/bookings/'+id, { method:'PATCH', body: JSON.stringify({ status:'cancelled' })});
    toast.success('Booking cancelled'); load();
  };
  // KPIs
  const completed = bookings.filter(b=>b.status==='completed').length;
  const active = bookings.filter(b=>b.status==='accepted').length;
  const totalSpent = bookings.filter(b=>b.status==='accepted'||b.status==='completed').reduce((s,b)=>s+(b.price||0),0);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center"><Home className="h-6 w-6 text-primary"/></div>
        <div><h2 className="text-2xl font-bold">Hello, {user.name}</h2><p className="text-sm text-muted-foreground">Manage bookings, complaints & household profile</p></div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardHeader className="pb-2"><CardDescription>Total Bookings</CardDescription><CardTitle className="text-2xl">{bookings.length}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Active</CardDescription><CardTitle className="text-2xl text-emerald-600">{active}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Completed</CardDescription><CardTitle className="text-2xl">{completed}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Total Spent</CardDescription><CardTitle className="text-2xl text-primary">₹{totalSpent.toLocaleString('en-IN')}</CardTitle></CardHeader></Card>
      </div>
      <Tabs defaultValue="bookings">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="bookings">My Bookings</TabsTrigger>
          <TabsTrigger value="complaints">Complaints</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>
        <TabsContent value="bookings" className="space-y-2 pt-3">
          {bookings.map(b => (
            <div key={b.id} className="flex items-center justify-between p-3 border rounded-lg gap-2 flex-wrap">
              <div>
                <div className="font-medium">{b.helper_name}</div>
                <div className="text-xs text-muted-foreground">{b.plan} · {b.start_date} · ₹{b.price?.toLocaleString('en-IN')}</div>
                <div className="text-xs">{b.address}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={b.status==='accepted'||b.status==='completed'?'default':b.status==='rejected'||b.status==='cancelled'?'destructive':'secondary'}>{b.status}</Badge>
                {(b.status==='pending'||b.status==='accepted') && <Button size="sm" variant="outline" onClick={()=>cancel(b.id)}><X className="h-3 w-3 mr-1"/>Cancel</Button>}
                <Button size="sm" variant="ghost" onClick={()=>{setComplaintBooking(b); setComplaintOpen(true);}}><MessageSquareWarning className="h-3 w-3 mr-1"/>Report</Button>
              </div>
            </div>
          ))}
          {!bookings.length && <p className="text-sm text-muted-foreground">No bookings yet.</p>}
        </TabsContent>
        <TabsContent value="complaints" className="space-y-2 pt-3">
          <Button size="sm" onClick={()=>{setComplaintBooking(null); setComplaintOpen(true);}}><MessageSquareWarning className="h-4 w-4 mr-1"/>New Complaint</Button>
          {complaints.map(c => (
            <div key={c.id} className="p-3 border rounded-lg space-y-1">
              <div className="flex justify-between items-start">
                <div className="font-medium">{c.subject}</div>
                <Badge variant={c.status==='resolved'?'default':'secondary'}>{c.status}</Badge>
              </div>
              <div className="text-sm text-muted-foreground">{c.message}</div>
              {c.helper_name && <div className="text-xs text-muted-foreground">Re: {c.helper_name}</div>}
              {c.admin_reply && <div className="text-sm bg-primary/5 p-2 rounded mt-1"><strong>Admin reply:</strong> {c.admin_reply}</div>}
            </div>
          ))}
          {!complaints.length && <p className="text-sm text-muted-foreground">No complaints filed.</p>}
        </TabsContent>
        <TabsContent value="profile" className="pt-3">
          <ProfileEditor user={user} onUpdate={onUpdateUser}/>
        </TabsContent>
      </Tabs>
      <ComplaintDialog open={complaintOpen} onOpenChange={setComplaintOpen} user={user} booking={complaintBooking} onSubmit={load}/>
    </div>
  );
}

function HelperDashboard({ user }) {
  const [bookings, setBookings] = useState([]);
  const [profile, setProfile] = useState(null);
  const [docs, setDocs] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [docType, setDocType] = useState('ID Proof');
  const [docFile, setDocFile] = useState(null);
  const load = async () => {
    const d = await api('/helpers?q='+encodeURIComponent(user.name));
    const mine = d.helpers.find(h => h.user_id === user.id);
    setProfile(mine);
    if (mine) {
      const b = await api('/bookings?helper_id='+mine.id); setBookings(b.bookings);
      const dd = await api('/documents?helper_id='+mine.id); setDocs(dd.documents);
      const at = await api('/attendance?helper_id='+mine.id); setAttendance(at.attendance);
    }
  };
  useEffect(()=>{ load(); },[user]);
  const respond = async (id, status) => {
    await api('/bookings/'+id, { method:'PATCH', body: JSON.stringify({ status })});
    toast.success('Booking '+status); load();
  };
  const markAttendance = async (booking, status) => {
    await api('/attendance', { method:'POST', body: JSON.stringify({
      booking_id: booking.id, helper_id: profile.id, helper_name: profile.name, user_id: booking.user_id, status,
      date: new Date().toISOString().slice(0,10)
    })});
    toast.success('Attendance marked: '+status); load();
  };
  const uploadDoc = async () => {
    if (!docFile || !profile) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        await api('/documents', { method:'POST', body: JSON.stringify({ helper_id: profile.id, type: docType, name: docFile.name, data: e.target.result })});
        toast.success('Document uploaded for review');
        setDocFile(null); load();
      } catch (err) { toast.error(err.message); }
    };
    reader.readAsDataURL(docFile);
  };
  const deleteDoc = async (id) => { await api('/documents/'+id, { method:'DELETE' }); load(); };
  const updateAvailability = async (val) => {
    await api('/helpers/'+profile.id, { method:'PATCH', body: JSON.stringify({ availability: val })});
    toast.success('Availability updated'); load();
  };
  const earnings = bookings.filter(b=>b.status==='accepted'||b.status==='completed').reduce((s,b)=>s+(b.price||0),0);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center"><Heart className="h-6 w-6 text-primary"/></div>
        <div><h2 className="text-2xl font-bold">Hello, {user.name}</h2><p className="text-sm text-muted-foreground">Manage your jobs, profile & documents</p></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card><CardHeader className="pb-2"><CardDescription>Total Jobs</CardDescription><CardTitle className="text-3xl">{bookings.length}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Total Earnings</CardDescription><CardTitle className="text-3xl text-primary">₹{earnings.toLocaleString('en-IN')}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Verification</CardDescription><CardTitle className="text-xl">{profile?.verified?<span className="text-emerald-600 flex items-center gap-1"><BadgeCheck className="h-5 w-5"/>Verified</span>:<span className="text-amber-600">Pending</span>}</CardTitle></CardHeader></Card>
      </div>
      <Tabs defaultValue="jobs">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="jobs">Job Requests</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="docs">Verification Documents</TabsTrigger>
          <TabsTrigger value="profile">Availability & Plans</TabsTrigger>
        </TabsList>
        <TabsContent value="jobs" className="space-y-2 pt-3">
          {bookings.map(b => (
            <div key={b.id} className="p-3 border rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{b.user_name}</div>
                  <div className="text-xs text-muted-foreground">{b.plan} · {b.start_date} · ₹{b.price?.toLocaleString('en-IN')}</div>
                  <div className="text-xs mt-1">{b.address}</div>
                  {b.notes && <div className="text-xs italic text-muted-foreground">Note: {b.notes}</div>}
                </div>
                <Badge variant={b.status==='accepted'?'default':b.status==='rejected'||b.status==='cancelled'?'destructive':'secondary'}>{b.status}</Badge>
              </div>
              {b.status==='pending' && (
                <div className="flex gap-2">
                  <Button size="sm" onClick={()=>respond(b.id,'accepted')}><CheckCircle2 className="h-4 w-4 mr-1"/>Accept</Button>
                  <Button size="sm" variant="destructive" onClick={()=>respond(b.id,'rejected')}><XCircle className="h-4 w-4 mr-1"/>Reject</Button>
                </div>
              )}
              {b.status==='accepted' && (
                <Button size="sm" variant="outline" onClick={()=>respond(b.id,'completed')}><CheckCircle2 className="h-4 w-4 mr-1"/>Mark Completed</Button>
              )}
            </div>
          ))}
          {!bookings.length && <p className="text-sm text-muted-foreground">No job requests yet.</p>}
        </TabsContent>
        <TabsContent value="attendance" className="space-y-3 pt-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Mark Today's Attendance</CardTitle><CardDescription>Track your presence for each accepted job.</CardDescription></CardHeader>
            <CardContent className="space-y-2">
              {bookings.filter(b=>b.status==='accepted'||b.status==='completed').length===0 && <p className="text-sm text-muted-foreground">No active jobs to mark attendance.</p>}
              {bookings.filter(b=>b.status==='accepted'||b.status==='completed').map(b => (
                <div key={b.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium text-sm">{b.user_name} · {b.plan}</div>
                    <div className="text-xs text-muted-foreground">{b.address}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={()=>markAttendance(b,'present')}><CheckCircle2 className="h-4 w-4 mr-1 text-emerald-600"/>Present</Button>
                    <Button size="sm" variant="outline" onClick={()=>markAttendance(b,'absent')}><XCircle className="h-4 w-4 mr-1 text-rose-600"/>Absent</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Attendance History</CardTitle></CardHeader>
            <CardContent className="space-y-1">
              {attendance.slice(0,20).map(a => (
                <div key={a.id} className="flex items-center justify-between p-2 border rounded text-sm">
                  <div><Calendar className="h-3 w-3 inline mr-1"/>{a.date}</div>
                  <Badge variant={a.status==='present'?'default':'destructive'}>{a.status}</Badge>
                </div>
              ))}
              {!attendance.length && <p className="text-sm text-muted-foreground">No attendance recorded yet.</p>}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="docs" className="space-y-3 pt-3">
          <Card>
            <CardHeader><CardTitle className="text-base">Upload Identity/Background Documents</CardTitle><CardDescription>Verified documents help you get approved faster.</CardDescription></CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div>
                  <Label>Document Type</Label>
                  <Select value={docType} onValueChange={setDocType}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ID Proof">ID Proof (Aadhaar/PAN)</SelectItem>
                      <SelectItem value="Address Proof">Address Proof</SelectItem>
                      <SelectItem value="Police Verification">Police Verification</SelectItem>
                      <SelectItem value="Reference Letter">Reference Letter</SelectItem>
                      <SelectItem value="Certificate">Training Certificate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label>File</Label>
                  <Input type="file" accept="image/*,.pdf" onChange={e=>setDocFile(e.target.files?.[0])}/>
                </div>
              </div>
              <Button onClick={uploadDoc} disabled={!docFile}><Upload className="h-4 w-4 mr-1"/>Upload</Button>
            </CardContent>
          </Card>
          <div className="space-y-2">
            {docs.map(d => (
              <div key={d.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground"/>
                  <div>
                    <div className="font-medium text-sm">{d.type}</div>
                    <div className="text-xs text-muted-foreground">{d.name}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={d.status==='approved'?'default':d.status==='rejected'?'destructive':'secondary'}>{d.status}</Badge>
                  <Button size="sm" variant="ghost" onClick={()=>deleteDoc(d.id)}><Trash2 className="h-4 w-4"/></Button>
                </div>
              </div>
            ))}
            {!docs.length && <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>}
          </div>
        </TabsContent>
        <TabsContent value="profile" className="pt-3 space-y-3">
          {profile && (
            <Card>
              <CardHeader><CardTitle className="text-base">Availability & Service Plans</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Availability</Label>
                  <Select value={profile.availability} onValueChange={updateAvailability}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>{AVAILABILITIES.map(a=><SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="border rounded-lg p-3 text-center"><div className="text-xs text-muted-foreground uppercase">Hourly</div><div className="text-lg font-bold text-primary">₹{profile.hourly_price}</div></div>
                  <div className="border rounded-lg p-3 text-center"><div className="text-xs text-muted-foreground uppercase">Monthly</div><div className="text-lg font-bold text-primary">₹{profile.monthly_price?.toLocaleString('en-IN')}</div></div>
                  <div className="border rounded-lg p-3 text-center"><div className="text-xs text-muted-foreground uppercase">Yearly</div><div className="text-lg font-bold text-primary">₹{profile.yearly_price?.toLocaleString('en-IN')}</div></div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AdminHelperReview({ helper, open, onOpenChange, onVerify, onReject }) {
  const [details, setDetails] = useState(null);
  const [docs, setDocs] = useState([]);
  useEffect(()=>{
    if (helper && open) {
      api('/helpers/'+helper.id).then(setDetails).catch(()=>{});
      api('/documents?helper_id='+helper.id).then(d=>setDocs(d.documents)).catch(()=>{});
    }
  },[helper, open]);
  if (!helper) return null;
  const service = SERVICES.find(s=>s.value===helper.service_type);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Shield className="h-5 w-5"/>Review Helper Application</DialogTitle>
          <DialogDescription>Review documents and profile before verifying.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4">
          <div className="space-y-3">
            <div className="relative rounded-lg overflow-hidden aspect-square bg-muted">
              <img src={helper.photo} alt={helper.name} className="w-full h-full object-cover"/>
              {helper.verified && <Badge className="absolute top-2 right-2 bg-emerald-600"><BadgeCheck className="h-3 w-3 mr-1"/>Verified</Badge>}
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{helper.name}</div>
              <div className="text-xs text-muted-foreground">{service?.icon} {service?.label} · {helper.city}</div>
              <div className="text-xs text-muted-foreground">{helper.experience} years exp</div>
              <div className="flex items-center justify-center gap-1 mt-1"><Star className="h-3 w-3 fill-amber-400 text-amber-400"/><span className="text-sm">{helper.rating || 'New'} ({helper.reviews_count})</span></div>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-sm mb-1">About</h4>
              <p className="text-sm text-muted-foreground">{helper.bio || 'No bio provided'}</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="border rounded p-2 text-center"><div className="text-xs text-muted-foreground uppercase">Hourly</div><div className="font-bold text-primary">₹{helper.hourly_price}</div></div>
              <div className="border rounded p-2 text-center"><div className="text-xs text-muted-foreground uppercase">Monthly</div><div className="font-bold text-primary">₹{helper.monthly_price?.toLocaleString('en-IN')}</div></div>
              <div className="border rounded p-2 text-center"><div className="text-xs text-muted-foreground uppercase">Yearly</div><div className="font-bold text-primary">₹{helper.yearly_price?.toLocaleString('en-IN')}</div></div>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-1">Skills</h4>
              <div className="flex flex-wrap gap-1">{helper.skills?.length ? helper.skills.map(s=><Badge key={s} variant="secondary">{s}</Badge>) : <span className="text-xs text-muted-foreground">None listed</span>}</div>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-1">Languages</h4>
              <div className="flex flex-wrap gap-1">{helper.languages?.length ? helper.languages.map(s=><Badge key={s} variant="outline">{s}</Badge>) : <span className="text-xs text-muted-foreground">None listed</span>}</div>
            </div>
            <div className="text-sm"><Clock className="h-3 w-3 inline mr-1"/><strong>Availability:</strong> {helper.availability}</div>
            <Separator/>
            <div>
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-1"><FileText className="h-4 w-4"/>Verification Documents ({docs.length})</h4>
              {docs.length === 0 && <p className="text-xs text-muted-foreground italic">⚠️ No documents uploaded by this helper yet.</p>}
              <div className="space-y-1">
                {docs.map(d => (
                  <div key={d.id} className="flex items-center justify-between p-2 border rounded text-sm">
                    <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground"/><span>{d.type}</span><span className="text-xs text-muted-foreground">— {d.name}</span></div>
                    <div className="flex items-center gap-2">
                      <a href={d.data} target="_blank" rel="noreferrer" className="text-xs text-primary underline">View</a>
                      <Badge variant={d.status==='approved'?'default':d.status==='rejected'?'destructive':'secondary'}>{d.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Separator/>
            <div>
              <h4 className="font-semibold text-sm mb-2">Recent Reviews ({details?.reviews?.length || 0})</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {details?.reviews?.slice(0,5).map(r => (
                  <div key={r.id} className="border rounded p-2 text-sm">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-medium">{r.user_name}</span>
                      <div className="flex items-center gap-0.5">{[1,2,3,4,5].map(i => <Star key={i} className={`h-3 w-3 ${i<=r.rating?'fill-amber-400 text-amber-400':'text-muted-foreground/30'}`}/>)}</div>
                    </div>
                    <p className="text-muted-foreground">{r.comment}</p>
                  </div>
                ))}
                {!details?.reviews?.length && <p className="text-xs text-muted-foreground italic">No reviews yet.</p>}
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          {helper.verified ? (
            <Button variant="destructive" onClick={()=>{onReject(helper); onOpenChange(false);}}><XCircle className="h-4 w-4 mr-1"/>Revoke Verification</Button>
          ) : (
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={()=>{onVerify(helper); onOpenChange(false);}}><BadgeCheck className="h-4 w-4 mr-1"/>Approve & Verify</Button>
          )}
          <Button variant="outline" onClick={()=>onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AdminBookingDetail({ booking, open, onOpenChange }) {
  if (!booking) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Booking Details</DialogTitle>
          <DialogDescription>#{booking.id.slice(0,8)}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div><span className="text-muted-foreground">Household</span><div className="font-medium">{booking.user_name}</div><div className="text-xs">{booking.user_email}</div></div>
            <div><span className="text-muted-foreground">Helper</span><div className="font-medium">{booking.helper_name}</div></div>
            <div><span className="text-muted-foreground">Plan</span><div className="font-medium capitalize">{booking.plan}{booking.hours?` · ${booking.hours}h`:''}</div></div>
            <div><span className="text-muted-foreground">Price</span><div className="font-medium text-primary">₹{booking.price?.toLocaleString('en-IN')}</div></div>
            <div><span className="text-muted-foreground">Start Date</span><div className="font-medium">{booking.start_date}</div></div>
            <div><span className="text-muted-foreground">Status</span><Badge variant={booking.status==='accepted'||booking.status==='completed'?'default':booking.status==='rejected'||booking.status==='cancelled'?'destructive':'secondary'} className="capitalize">{booking.status}</Badge></div>
          </div>
          <div><span className="text-muted-foreground">Address</span><div>{booking.address || '—'}</div></div>
          {booking.notes && <div><span className="text-muted-foreground">Notes</span><div className="italic">{booking.notes}</div></div>}
          <div className="text-xs text-muted-foreground">Created: {new Date(booking.created_at).toLocaleString()}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AdminUserDetail({ user, open, onOpenChange, onDelete }) {
  if (!user) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><User className="h-5 w-5"/>User Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div><span className="text-muted-foreground">Name</span><div className="font-medium">{user.name}</div></div>
            <div><span className="text-muted-foreground">Role</span><Badge variant="outline" className="capitalize">{user.role}</Badge></div>
            <div><span className="text-muted-foreground">Email</span><div>{user.email}</div></div>
            <div><span className="text-muted-foreground">Phone</span><div>{user.phone || '—'}</div></div>
            <div><span className="text-muted-foreground">City</span><div>{user.city || '—'}</div></div>
            <div><span className="text-muted-foreground">Family Size</span><div>{user.family_size || '—'}</div></div>
          </div>
          {user.address && <div><span className="text-muted-foreground">Address</span><div>{user.address}</div></div>}
          {user.preferences && <div><span className="text-muted-foreground">Preferences</span><div className="italic">{user.preferences}</div></div>}
          <div className="text-xs text-muted-foreground">Joined: {new Date(user.created_at).toLocaleDateString()}</div>
        </div>
        <DialogFooter>
          {user.role !== 'admin' && <Button variant="destructive" onClick={()=>{onDelete(user.id); onOpenChange(false);}}><Trash2 className="h-4 w-4 mr-1"/>Remove User</Button>}
          <Button variant="outline" onClick={()=>onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [helpers, setHelpers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [docs, setDocs] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [categories, setCategories] = useState([]);
  const [replyMap, setReplyMap] = useState({});
  const [newCat, setNewCat] = useState({ name:'', icon:'✨', description:'' });
  const [reviewHelper, setReviewHelper] = useState(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [bookingDetail, setBookingDetail] = useState(null);
  const [userDetail, setUserDetail] = useState(null);
  const load = async () => {
    setStats(await api('/admin/stats'));
    setAnalytics(await api('/admin/analytics'));
    setHelpers((await api('/admin/helpers')).helpers);
    setBookings((await api('/bookings?all=true')).bookings);
    setUsers((await api('/admin/users')).users);
    setComplaints((await api('/complaints?all=true')).complaints);
    setDocs((await api('/documents')).documents);
    setAttendance((await api('/attendance?all=true')).attendance);
    setCategories((await api('/categories')).categories);
  };
  useEffect(()=>{ load(); },[]);
  const toggleVerify = async (h) => {
    await api('/helpers/'+h.id, { method:'PATCH', body: JSON.stringify({ verified: !h.verified })});
    toast.success(h.verified?'Verification revoked':'Helper verified'); load();
  };
  const deleteUser = async (id) => { await api('/admin/users/'+id, { method:'DELETE' }); toast.success('User removed'); load(); };
  const reviewDoc = async (id, status) => { await api('/documents/'+id, { method:'PATCH', body: JSON.stringify({ status })}); toast.success('Document '+status); load(); };
  const resolveComplaint = async (c) => {
    const reply = replyMap[c.id] || '';
    await api('/complaints/'+c.id, { method:'PATCH', body: JSON.stringify({ status:'resolved', admin_reply: reply })});
    toast.success('Complaint resolved'); load();
  };
  const addCategory = async () => {
    if (!newCat.name) return;
    await api('/categories', { method:'POST', body: JSON.stringify(newCat) });
    setNewCat({ name:'', icon:'✨', description:'' }); toast.success('Category added'); load();
  };
  const toggleCategory = async (c) => { await api('/categories/'+c.id, { method:'PATCH', body: JSON.stringify({ active: !c.active })}); load(); };
  const deleteCategory = async (id) => { await api('/categories/'+id, { method:'DELETE' }); toast.success('Category removed'); load(); };
  const CHART_COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4'];
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center"><Shield className="h-6 w-6 text-primary"/></div>
        <div><h2 className="text-2xl font-bold">Admin Panel</h2><p className="text-sm text-muted-foreground">Platform management & analytics</p></div>
      </div>
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <Card><CardHeader className="pb-2"><CardDescription>Households</CardDescription><CardTitle className="text-2xl">{stats.users}</CardTitle></CardHeader></Card>
          <Card><CardHeader className="pb-2"><CardDescription>Helpers</CardDescription><CardTitle className="text-2xl">{stats.helpers}</CardTitle></CardHeader></Card>
          <Card><CardHeader className="pb-2"><CardDescription>Verified</CardDescription><CardTitle className="text-2xl text-emerald-600">{stats.verifiedHelpers}</CardTitle></CardHeader></Card>
          <Card><CardHeader className="pb-2"><CardDescription>Bookings</CardDescription><CardTitle className="text-2xl">{stats.bookings}</CardTitle></CardHeader></Card>
          <Card><CardHeader className="pb-2"><CardDescription>Cancelled</CardDescription><CardTitle className="text-2xl text-rose-600">{stats.cancelled}</CardTitle></CardHeader></Card>
          <Card><CardHeader className="pb-2"><CardDescription>Open Complaints</CardDescription><CardTitle className="text-2xl text-amber-600">{stats.openComplaints}</CardTitle></CardHeader></Card>
        </div>
      )}
      <Tabs defaultValue="analytics">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="analytics">📊 Analytics</TabsTrigger>
          <TabsTrigger value="helpers">Helper Verification</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="complaints">Complaints</TabsTrigger>
        </TabsList>
        <TabsContent value="analytics" className="pt-3 space-y-4">
          {analytics && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card><CardHeader className="pb-2"><CardDescription className="flex items-center gap-1"><TrendingUp className="h-3 w-3"/>Completion Rate</CardDescription><CardTitle className="text-3xl text-emerald-600">{analytics.completionRate}%</CardTitle></CardHeader></Card>
                <Card><CardHeader className="pb-2"><CardDescription className="flex items-center gap-1"><Star className="h-3 w-3"/>Avg Satisfaction</CardDescription><CardTitle className="text-3xl text-amber-600">{analytics.avgSatisfaction}★</CardTitle></CardHeader></Card>
                <Card><CardHeader className="pb-2"><CardDescription className="flex items-center gap-1"><Users className="h-3 w-3"/>Monthly Active Users</CardDescription><CardTitle className="text-3xl">{analytics.mau}</CardTitle></CardHeader></Card>
                <Card><CardHeader className="pb-2"><CardDescription className="flex items-center gap-1"><DollarSign className="h-3 w-3"/>Total Revenue</CardDescription><CardTitle className="text-3xl text-primary">₹{(analytics.totalRevenue||0).toLocaleString('en-IN')}</CardTitle></CardHeader></Card>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader><CardTitle className="text-base">Revenue Trend (6 months)</CardTitle></CardHeader>
                  <CardContent style={{height:260}}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analytics.months}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3}/>
                        <XAxis dataKey="name" fontSize={12}/>
                        <YAxis fontSize={12}/>
                        <Tooltip formatter={(v)=>'₹'+v.toLocaleString('en-IN')}/>
                        <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} dot={{r:4}}/>
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-base">Bookings by Month</CardTitle></CardHeader>
                  <CardContent style={{height:260}}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.months}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3}/>
                        <XAxis dataKey="name" fontSize={12}/>
                        <YAxis fontSize={12}/>
                        <Tooltip/>
                        <Bar dataKey="bookings" fill="#10b981"/>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-base">Booking Status Breakdown</CardTitle></CardHeader>
                  <CardContent style={{height:280}}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics.statusCounts.filter(s=>s.value>0)}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={85}
                          paddingAngle={2}
                        >
                          {analytics.statusCounts.filter(s=>s.value>0).map((_,i)=>(<Cell key={i} fill={CHART_COLORS[i%CHART_COLORS.length]}/>))}
                        </Pie>
                        <Tooltip/>
                        <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                      </PieChart>
                    </ResponsiveContainer>
                    {analytics.statusCounts.every(s=>s.value===0) && (
                      <div className="text-center text-sm text-muted-foreground -mt-40">No booking data yet</div>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-base">Plan & Service Distribution</CardTitle></CardHeader>
                  <CardContent style={{height:260}}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.planCounts.map((p,i)=>({...p, service: analytics.serviceCounts[i]?.value||0, serviceName: analytics.serviceCounts[i]?.name||''}))}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3}/>
                        <XAxis dataKey="name" fontSize={12}/>
                        <YAxis fontSize={12}/>
                        <Tooltip/>
                        <Legend/>
                        <Bar dataKey="value" name="Plan bookings" fill="#8b5cf6"/>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Award className="h-4 w-4 text-amber-500"/>Top Rated Helpers</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {analytics.topHelpers.map((h,i) => (
                    <div key={i} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-primary">#{i+1}</span>
                        <span className="font-medium">{h.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm"><Star className="h-3 w-3 fill-amber-400 text-amber-400"/>{h.rating} <span className="text-muted-foreground">({h.reviews} reviews)</span></div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
        <TabsContent value="helpers" className="space-y-2 pt-3">
          <p className="text-xs text-muted-foreground italic mb-2">💡 Click any helper to review their profile, documents & reviews before verifying.</p>
          {helpers.map(h => {
            const helperDocs = docs.filter(d=>d.helper_id===h.id);
            const pendingDocs = helperDocs.filter(d=>d.status==='pending').length;
            return (
              <div key={h.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/40 hover:border-primary/40 transition-colors cursor-pointer" onClick={()=>{setReviewHelper(h); setReviewOpen(true);}}>
                <div className="flex items-center gap-3">
                  <Avatar><AvatarImage src={h.photo}/><AvatarFallback>{h.name?.[0]}</AvatarFallback></Avatar>
                  <div>
                    <div className="font-medium flex items-center gap-2">{h.name}{pendingDocs>0 && <Badge variant="secondary" className="text-xs">{pendingDocs} docs pending</Badge>}</div>
                    <div className="text-xs text-muted-foreground">{h.service_type} · {h.city} · {h.experience}y · {helperDocs.length} docs uploaded</div>
                  </div>
                </div>
                <div className="flex items-center gap-2" onClick={e=>e.stopPropagation()}>
                  {h.verified?<Badge className="bg-emerald-600"><BadgeCheck className="h-3 w-3 mr-1"/>Verified</Badge>:<Badge variant="secondary">Pending</Badge>}
                  <Switch checked={h.verified} onCheckedChange={()=>toggleVerify(h)}/>
                  <Button size="sm" variant="outline" onClick={(e)=>{e.stopPropagation(); setReviewHelper(h); setReviewOpen(true);}}>Review →</Button>
                </div>
              </div>
            );
          })}
        </TabsContent>
        <TabsContent value="documents" className="space-y-2 pt-3">
          {docs.map(d => {
            const helper = helpers.find(h=>h.id===d.helper_id);
            return (
              <div key={d.id} className="flex items-center justify-between p-3 border rounded-lg gap-2 flex-wrap">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5"/>
                  <div>
                    <div className="font-medium text-sm">{helper?.name || 'Helper'} — {d.type}</div>
                    <div className="text-xs text-muted-foreground">{d.name}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a href={d.data} target="_blank" rel="noreferrer" className="text-xs text-primary underline">View</a>
                  <Badge variant={d.status==='approved'?'default':d.status==='rejected'?'destructive':'secondary'}>{d.status}</Badge>
                  {d.status==='pending' && (
                    <>
                      <Button size="sm" onClick={()=>reviewDoc(d.id,'approved')}>Approve</Button>
                      <Button size="sm" variant="destructive" onClick={()=>reviewDoc(d.id,'rejected')}>Reject</Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
          {!docs.length && <p className="text-sm text-muted-foreground">No documents uploaded.</p>}
        </TabsContent>
        <TabsContent value="bookings" className="space-y-2 pt-3">
          <p className="text-xs text-muted-foreground italic mb-2">💡 Click any booking to view full details.</p>
          {bookings.map(b => (
            <div key={b.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/40 hover:border-primary/40 cursor-pointer transition-colors" onClick={()=>setBookingDetail(b)}>
              <div>
                <div className="font-medium">{b.user_name} → {b.helper_name}</div>
                <div className="text-xs text-muted-foreground">{b.plan} · {b.start_date} · ₹{b.price?.toLocaleString('en-IN')}</div>
              </div>
              <Badge variant={b.status==='accepted'||b.status==='completed'?'default':b.status==='rejected'||b.status==='cancelled'?'destructive':'secondary'}>{b.status}</Badge>
            </div>
          ))}
        </TabsContent>
        <TabsContent value="users" className="space-y-2 pt-3">
          <p className="text-xs text-muted-foreground italic mb-2">💡 Click any user to view their full profile.</p>
          {users.map(u => (
            <div key={u.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/40 hover:border-primary/40 cursor-pointer transition-colors" onClick={()=>setUserDetail(u)}>
              <div className="flex items-center gap-3">
                <Avatar><AvatarFallback>{u.name?.[0]}</AvatarFallback></Avatar>
                <div>
                  <div className="font-medium">{u.name}</div>
                  <div className="text-xs text-muted-foreground">{u.email} · {u.city || '—'}</div>
                </div>
              </div>
              <div className="flex items-center gap-2" onClick={e=>e.stopPropagation()}>
                <Badge variant="outline" className="capitalize">{u.role}</Badge>
                {u.role!=='admin' && <Button size="sm" variant="ghost" onClick={()=>deleteUser(u.id)}><Trash2 className="h-4 w-4"/></Button>}
              </div>
            </div>
          ))}
        </TabsContent>
        <TabsContent value="complaints" className="space-y-2 pt-3">
          {complaints.map(c => (
            <div key={c.id} className="p-3 border rounded-lg space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{c.subject}</div>
                  <div className="text-xs text-muted-foreground">By {c.user_name} {c.helper_name?`· Re: ${c.helper_name}`:''}</div>
                </div>
                <Badge variant={c.status==='resolved'?'default':'secondary'}>{c.status}</Badge>
              </div>
              <div className="text-sm text-muted-foreground">{c.message}</div>
              {c.admin_reply && <div className="text-sm bg-primary/5 p-2 rounded"><strong>Reply:</strong> {c.admin_reply}</div>}
              {c.status==='open' && (
                <div className="flex gap-2 items-center">
                  <Input placeholder="Write reply..." value={replyMap[c.id]||''} onChange={e=>setReplyMap({...replyMap,[c.id]:e.target.value})}/>
                  <Button size="sm" onClick={()=>resolveComplaint(c)}><Send className="h-4 w-4 mr-1"/>Resolve</Button>
                </div>
              )}
            </div>
          ))}
          {!complaints.length && <p className="text-sm text-muted-foreground">No complaints filed.</p>}
        </TabsContent>
        <TabsContent value="attendance" className="space-y-2 pt-3">
          <Card>
            <CardHeader><CardTitle className="text-base">Attendance Records</CardTitle><CardDescription>Monitor helper attendance across all jobs.</CardDescription></CardHeader>
            <CardContent className="space-y-1">
              {attendance.slice(0,50).map(a => (
                <div key={a.id} className="flex items-center justify-between p-2 border rounded text-sm">
                  <div>
                    <span className="font-medium">{a.helper_name}</span>
                    <span className="text-muted-foreground ml-2">{a.date}</span>
                  </div>
                  <Badge variant={a.status==='present'?'default':'destructive'}>{a.status}</Badge>
                </div>
              ))}
              {!attendance.length && <p className="text-sm text-muted-foreground">No attendance records yet.</p>}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="categories" className="space-y-3 pt-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Add Service Category</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <div><Label>Name</Label><Input value={newCat.name} onChange={e=>setNewCat({...newCat,name:e.target.value})} placeholder="e.g. Cook"/></div>
                <div><Label>Icon</Label><Input value={newCat.icon} onChange={e=>setNewCat({...newCat,icon:e.target.value})} placeholder="🍳"/></div>
                <div className="md:col-span-2"><Label>Description</Label><Input value={newCat.description} onChange={e=>setNewCat({...newCat,description:e.target.value})}/></div>
              </div>
              <Button onClick={addCategory}><Plus className="h-4 w-4 mr-1"/>Add Category</Button>
            </CardContent>
          </Card>
          <div className="space-y-2">
            {categories.map(c => (
              <div key={c.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{c.icon}</div>
                  <div>
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={c.active} onCheckedChange={()=>toggleCategory(c)}/>
                  <Button size="sm" variant="ghost" onClick={()=>deleteCategory(c.id)}><Trash2 className="h-4 w-4"/></Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      <AdminHelperReview helper={reviewHelper} open={reviewOpen} onOpenChange={setReviewOpen} onVerify={(h)=>toggleVerify(h)} onReject={(h)=>toggleVerify(h)}/>
      <AdminBookingDetail booking={bookingDetail} open={!!bookingDetail} onOpenChange={(o)=>!o&&setBookingDetail(null)}/>
      <AdminUserDetail user={userDetail} open={!!userDetail} onOpenChange={(o)=>!o&&setUserDetail(null)} onDelete={deleteUser}/>
    </div>
  );
}

function App() {
  const { user, login, logout } = useAuth();
  const [helpers, setHelpers] = useState([]);
  const [filters, setFilters] = useState({ service:'all', city:'all', q:'', minExp:0, availability:'all', verifiedOnly:false, plan:'all' });
  const [selectedHelper, setSelectedHelper] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [bookingHelper, setBookingHelper] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [view, setView] = useState('home'); // home | dashboard
  const [loading, setLoading] = useState(true);

  const loginAndRoute = (u) => { login(u); if (u.role !== 'household') setView('dashboard'); };

  const loadHelpers = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k,v])=>{ if (v && v!=='all' && v!=='' && v!==0 && v!==false) params.set(k, v); });
    const d = await api('/helpers?'+params.toString());
    setHelpers(d.helpers);
    setLoading(false);
  };
  useEffect(()=>{ loadHelpers(); },[filters]);

  const openHelper = (h) => { setSelectedHelper(h); setSheetOpen(true); };
  const startBooking = (h) => { 
    if (!user) { toast.error('Please log in to book'); setAuthMode('login'); setAuthOpen(true); return; }
    setSheetOpen(false); setBookingHelper(h);
  };

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <button className="flex items-center gap-2" onClick={()=>setView('home')}>
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary-foreground"/>
            </div>
            <span className="text-xl font-bold tracking-tight">Helper<span className="text-primary">4U</span></span>
          </button>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Button variant="ghost" onClick={()=>setView(view==='dashboard'?'home':'dashboard')}>
                  {view==='dashboard'?<><Search className="h-4 w-4 mr-1"/>Browse</>:<><Users className="h-4 w-4 mr-1"/>Dashboard</>}
                </Button>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted">
                  <Avatar className="h-7 w-7"><AvatarFallback>{user.name?.[0]}</AvatarFallback></Avatar>
                  <span className="text-sm font-medium">{user.name}</span>
                  <Badge variant="outline" className="text-xs">{user.role}</Badge>
                </div>
                <Button variant="outline" size="sm" onClick={()=>{logout(); setView('home'); toast.success('Logged out');}}><LogOut className="h-4 w-4"/></Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={()=>{setAuthMode('login'); setAuthOpen(true);}}><LogIn className="h-4 w-4 mr-1"/>Log in</Button>
                <Button onClick={()=>{setAuthMode('register'); setAuthOpen(true);}}><UserPlus className="h-4 w-4 mr-1"/>Sign up</Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {view === 'dashboard' && user ? (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          {user.role==='admin' && <AdminDashboard/>}
          {user.role==='helper' && <HelperDashboard user={user}/>}
          {user.role==='household' && <UserDashboard user={user} onUpdateUser={login}/>}
        </div>
      ) : (
        <>
          {/* Hero */}
          <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/20 border-b">
            <div className="container mx-auto px-4 py-14 md:py-20 grid md:grid-cols-2 gap-10 items-center">
              <div className="space-y-6">
                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200"><BadgeCheck className="h-3 w-3 mr-1"/>100% Background Verified</Badge>
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
                  Trusted <span className="text-primary">Maids</span>, <span className="text-primary">Nannies</span> & Babysitters<br/>for every home.
                </h1>
                <p className="text-lg text-muted-foreground max-w-lg">Skip the sketchy agents. Book verified domestic help with flexible hourly, monthly & yearly plans — with transparent pricing and real reviews.</p>
                <div className="flex flex-wrap gap-3">
                  {(!user || user.role==='household') && (
                    <Button size="lg" onClick={()=>document.getElementById('browse')?.scrollIntoView({behavior:'smooth'})}><Search className="h-5 w-5 mr-2"/>Find a Helper</Button>
                  )}
                  {!user && (
                    <Button size="lg" variant="outline" onClick={()=>{setAuthMode('register'); setAuthOpen(true);}}><Heart className="h-5 w-5 mr-2"/>Become a Helper</Button>
                  )}
                  {user && user.role!=='household' && (
                    <Button size="lg" onClick={()=>setView('dashboard')}><Users className="h-5 w-5 mr-2"/>Go to my Dashboard</Button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-4 pt-4 max-w-md">
                  <div><div className="text-2xl font-bold text-primary">8+</div><div className="text-xs text-muted-foreground">Verified Helpers</div></div>
                  <div><div className="text-2xl font-bold text-primary">7</div><div className="text-xs text-muted-foreground">Cities</div></div>
                  <div><div className="text-2xl font-bold text-primary">4.8★</div><div className="text-xs text-muted-foreground">Avg Rating</div></div>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
                  <img src="https://images.pexels.com/photos/8954794/pexels-photo-8954794.jpeg" alt="Nanny with kids" className="w-full h-full object-cover"/>
                </div>
                <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 border">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center"><BadgeCheck className="h-6 w-6 text-emerald-600"/></div>
                    <div>
                      <div className="font-semibold">Background Verified</div>
                      <div className="text-xs text-muted-foreground">ID + Address + References</div>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-xl p-4 border hidden md:block">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center"><Star className="h-6 w-6 fill-amber-500 text-amber-500"/></div>
                    <div>
                      <div className="font-semibold">Real Reviews</div>
                      <div className="text-xs text-muted-foreground">From verified households</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Service categories */}
          {(!user || user.role==='household') && (
          <section className="container mx-auto px-4 py-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {SERVICES.map(s => (
                <button key={s.value} onClick={()=>setFilters({...filters, service:s.value})} className="group text-left p-6 rounded-2xl border-2 hover:border-primary hover:shadow-lg transition-all bg-card">
                  <div className="text-4xl mb-2">{s.icon}</div>
                  <h3 className="text-xl font-bold">{s.label}</h3>
                  <p className="text-sm text-muted-foreground mt-1">Browse verified {s.label.toLowerCase()}s in your city</p>
                  <div className="mt-3 text-sm text-primary font-medium group-hover:underline">Explore →</div>
                </button>
              ))}
            </div>
          </section>
          )}

          {/* Browse */}
          {(!user || user.role==='household') && (
          <section id="browse" className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div>
                <h2 className="text-3xl font-bold">Browse Helpers</h2>
                <p className="text-muted-foreground">{helpers.length} helpers available</p>
              </div>
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-8 gap-3">
                  <div className="md:col-span-2">
                    <Label className="text-xs">Search by name</Label>
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
                      <Input className="pl-9" placeholder="Search..." value={filters.q} onChange={e=>setFilters({...filters,q:e.target.value})}/>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Service</Label>
                    <Select value={filters.service} onValueChange={v=>setFilters({...filters,service:v})}>
                      <SelectTrigger><SelectValue/></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Services</SelectItem>
                        {SERVICES.map(s=><SelectItem key={s.value} value={s.value}>{s.icon} {s.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">City</Label>
                    <Select value={filters.city} onValueChange={v=>setFilters({...filters,city:v})}>
                      <SelectTrigger><SelectValue/></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Cities</SelectItem>
                        {CITIES.map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Service Plan</Label>
                    <Select value={filters.plan} onValueChange={v=>setFilters({...filters,plan:v})}>
                      <SelectTrigger><SelectValue/></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Plans</SelectItem>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Min Experience</Label>
                    <Select value={String(filters.minExp)} onValueChange={v=>setFilters({...filters,minExp:Number(v)})}>
                      <SelectTrigger><SelectValue/></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Any</SelectItem>
                        <SelectItem value="1">1+ years</SelectItem>
                        <SelectItem value="3">3+ years</SelectItem>
                        <SelectItem value="5">5+ years</SelectItem>
                        <SelectItem value="10">10+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Availability</Label>
                    <Select value={filters.availability} onValueChange={v=>setFilters({...filters,availability:v})}>
                      <SelectTrigger><SelectValue/></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any</SelectItem>
                        {AVAILABILITIES.map(a=><SelectItem key={a} value={a}>{a}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <div className="flex items-center gap-2 h-10">
                      <Switch checked={filters.verifiedOnly} onCheckedChange={v=>setFilters({...filters,verifiedOnly:v})}/>
                      <Label className="text-sm cursor-pointer">Verified only</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[...Array(6)].map((_,i)=><div key={i} className="h-96 rounded-lg bg-muted animate-pulse"/>)}
              </div>
            ) : helpers.length===0 ? (
              <div className="text-center py-20 text-muted-foreground">No helpers match your filters. Try adjusting.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {helpers.map(h => <HelperCard key={h.id} helper={h} onClick={()=>openHelper(h)}/>)}
              </div>
            )}
          </section>
          )}

          {/* Trust section */}
          <section className="bg-muted/30 border-t mt-12">
            <div className="container mx-auto px-4 py-14">
              <h2 className="text-3xl font-bold text-center mb-10">Why Helper4U?</h2>
              <div className="grid md:grid-cols-4 gap-6">
                {[
                  { icon: Shield, title:'Background Verified', desc:'Every helper is ID & address verified with references.' },
                  { icon: Calendar, title:'Flexible Plans', desc:'Book hourly, monthly, or yearly — pay only for what you need.' },
                  { icon: Star, title:'Rated & Reviewed', desc:'Read genuine reviews from real households before you book.' },
                  { icon: Users, title:'Accountability', desc:'Admin oversight and dispute resolution for peace of mind.' },
                ].map((f,i)=>(
                  <div key={i} className="text-center space-y-3">
                    <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center"><f.icon className="h-7 w-7 text-primary"/></div>
                    <h3 className="font-semibold text-lg">{f.title}</h3>
                    <p className="text-sm text-muted-foreground">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <footer className="border-t">
            <div className="container mx-auto px-4 py-6 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
              <div>© 2025 Helper4U. Building trust in domestic services.</div>
              <div className="flex gap-4">
                <span>Admin demo: admin@helper4u.com / admin123</span>
              </div>
            </div>
          </footer>
        </>
      )}

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} mode={authMode} setMode={setAuthMode} onSuccess={loginAndRoute}/>
      <HelperDetailSheet helper={selectedHelper} open={sheetOpen} onOpenChange={setSheetOpen} user={user} onBook={startBooking}/>
      <BookingDialog helper={bookingHelper} open={!!bookingHelper} onOpenChange={(o)=>!o&&setBookingHelper(null)} user={user} onBooked={()=>{}}/>
    </div>
  );
}

export default App;
