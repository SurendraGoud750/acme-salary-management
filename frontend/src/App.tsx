import { useEffect, useMemo, useState } from 'react';
import {
  Alert, AppBar, Avatar, Box, Button, Card, CardContent, Chip, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, Divider, Drawer, FormControl, Grid, IconButton, InputAdornment, MenuItem,
  Paper, Select, Snackbar, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination,
  TableRow, TextField, Toolbar, Typography
} from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import type { DashboardSummary, Employee, Salary } from './types';
import { addSalary, countryOptions, departmentOptions, getDashboard, getEmployee, getEmployees } from './api';

const drawerWidth = 238;
const currencyFmt = (amount?: string | number, currency = 'USD') => amount == null ? '—' : new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(Number(amount));
const statusLabel: Record<string, string> = { active: 'Active', on_leave: 'On leave', inactive: 'Inactive' };

function StatCard({ title, value, sub, icon, tone }: { title: string; value: string; sub: string; icon: React.ReactNode; tone: string }) {
  return <Card sx={{ height: '100%' }}><CardContent sx={{ p: 2.5 }}>
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
      <Box><Typography variant="body2" color="text.secondary">{title}</Typography><Typography variant="h4" fontWeight={750} mt={1}>{value}</Typography><Stack direction="row" alignItems="center" spacing={.5} mt={1}><ArrowUpwardRoundedIcon sx={{ color: '#159570', fontSize: 15 }}/><Typography variant="caption" color="text.secondary">{sub}</Typography></Stack></Box>
      <Box sx={{ bgcolor: tone, color: '#fff', p: 1.25, borderRadius: 2, display: 'flex' }}>{icon}</Box>
    </Stack>
  </CardContent></Card>;
}

function SalaryDialog({ employee, onClose, onSaved }: { employee: Employee | null; onClose: () => void; onSaved: (salary: Salary) => void }) {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(employee?.current_salary?.currency || 'USD');
  const [frequency, setFrequency] = useState<'annual'|'monthly'|'hourly'>('annual');
  const [effective, setEffective] = useState(new Date().toISOString().slice(0,10));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => { setCurrency(employee?.current_salary?.currency || 'USD'); setAmount(''); setError(''); }, [employee]);
  const submit = async () => {
    if (!employee) return;
    if (!amount || !Number.isFinite(Number(amount)) || Number(amount) <= 0) { setError('Enter a salary amount greater than zero.'); return; }
    if (!effective) { setError('Choose an effective date.'); return; }
    setSaving(true); setError('');
    try {
      const salary = await addSalary(employee.id, { amount: Number(amount).toFixed(2), currency, pay_frequency: frequency, effective_from: effective });
      onSaved(salary); onClose();
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not save salary.'); }
    finally { setSaving(false); }
  };
  return <Dialog open={!!employee} onClose={onClose} fullWidth maxWidth="sm">
    <DialogTitle>Update salary <Typography color="text.secondary" variant="body2">{employee?.full_name} · {employee?.employee_number}</Typography></DialogTitle>
    <DialogContent><Stack spacing={2.2} mt={1}>
      <Alert severity="info">A new salary record will be created. The previous salary period will be preserved.</Alert>
      <TextField label="Salary amount" type="number" value={amount} onChange={e=>setAmount(e.target.value)} inputProps={{ min: 0, step: 0.01 }} fullWidth required />
      <Grid container spacing={2}><Grid item xs={6}><FormControl fullWidth><Typography variant="caption" mb={.5}>Currency</Typography><Select value={currency} onChange={e=>setCurrency(e.target.value)}>{['USD','EUR','GBP','INR','CAD','AUD','SGD'].map(c=><MenuItem key={c} value={c}>{c}</MenuItem>)}</Select></FormControl></Grid>
      <Grid item xs={6}><FormControl fullWidth><Typography variant="caption" mb={.5}>Pay frequency</Typography><Select value={frequency} onChange={e=>setFrequency(e.target.value as typeof frequency)}><MenuItem value="annual">Annual</MenuItem><MenuItem value="monthly">Monthly</MenuItem><MenuItem value="hourly">Hourly</MenuItem></Select></FormControl></Grid></Grid>
      <TextField label="Effective from" type="date" value={effective} onChange={e=>setEffective(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth required />
      {error && <Alert severity="error">{error}</Alert>}
    </Stack></DialogContent><DialogActions sx={{ p: 2.5 }}><Button onClick={onClose} color="inherit">Cancel</Button><Button onClick={submit} variant="contained" disabled={saving}>{saving ? 'Saving…' : 'Save salary change'}</Button></DialogActions>
  </Dialog>;
}

export default function App() {
  const [tab, setTab] = useState<'overview'|'employees'|'reports'>('overview');
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Employee | null>(null);
  const [profile, setProfile] = useState<Employee | null>(null);
  const [snack, setSnack] = useState('');
  const [error, setError] = useState('');
  const [reportCurrency, setReportCurrency] = useState('all');

  const loadEmployees = async () => {
    setLoading(true); setError('');
    try {
      const res = await getEmployees({ search, country, department, status, page: page + 1, perPage: 10 });
      setEmployees(res.data); setTotal(res.meta.total);
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not load employees.'); }
    finally { setLoading(false); }
  };
  const loadSummary = async () => { try { setSummary(await getDashboard()); } catch (e) { setError(e instanceof Error ? e.message : 'Could not load dashboard.'); } };
  useEffect(() => { loadSummary(); }, []);
  useEffect(() => { loadEmployees(); }, [search, country, department, status, page]);
  const reportRows = useMemo(() => Object.entries(summary?.average_salary_by_currency || {}).filter(([c])=>reportCurrency==='all'||c===reportCurrency), [summary, reportCurrency]);

  const openProfile = async (e: Employee) => {
    try { setProfile(await getEmployee(e.id)); } catch { setProfile(e); }
  };
  const onSalarySaved = async () => {
    setSnack('Salary updated and history preserved.');
    await loadEmployees(); await loadSummary();
    if (profile) setProfile(await getEmployee(profile.id));
  };

  return <Box sx={{ display: 'flex', minHeight: '100vh' }}>
    <Drawer variant="permanent" sx={{ width: drawerWidth, flexShrink: 0, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', border: 0, borderRight: '1px solid #e8edf4', bgcolor: '#fff', px: 2, py: 2.5 } }}>
      <Stack direction="row" alignItems="center" spacing={1.2} px={1.2} mb={4}><Avatar sx={{ bgcolor: '#4f46e5', borderRadius: 2, width: 38, height: 38, fontWeight: 800 }}>A</Avatar><Box><Typography fontWeight={800} letterSpacing="-.4px">ACME</Typography><Typography variant="caption" color="text.secondary">People & compensation</Typography></Box></Stack>
      <Typography variant="overline" color="text.secondary" px={1.5} mb={1}>WORKSPACE</Typography>
      {([{id:'overview',label:'Overview',icon:<DashboardRoundedIcon/>},{id:'employees',label:'Employees',icon:<PeopleAltRoundedIcon/>},{id:'reports',label:'Salary reports',icon:<QueryStatsRoundedIcon/>}] as const).map(item=><Button key={item.id} fullWidth startIcon={item.icon} onClick={()=>{setTab(item.id);setProfile(null);}} sx={{ justifyContent:'flex-start', px:1.5, py:1.25, mb:.5, color:tab===item.id?'primary.main':'text.secondary', bgcolor:tab===item.id?'#eef0ff':'transparent', '&:hover':{bgcolor:'#f4f5ff'} }}>{item.label}</Button>)}
      <Box sx={{ mt:'auto', p:1.5, bgcolor:'#f7f8fc', borderRadius:2.5 }}><Typography variant="caption" color="text.secondary">DEMO WORKSPACE</Typography><Typography fontWeight={650} fontSize={13} mt={.5}>ACME Global · HR Team</Typography><Typography variant="caption" color="text.secondary">10,000 synthetic employees</Typography></Box>
    </Drawer>
    <Box component="main" sx={{ flexGrow:1, minWidth:0 }}>
      <AppBar position="sticky" elevation={0} color="inherit" sx={{ borderBottom:'1px solid #e8edf4', bgcolor:'rgba(255,255,255,.92)', backdropFilter:'blur(12px)' }}><Toolbar sx={{ justifyContent:'space-between' }}><Box><Typography variant="caption" color="text.secondary">ACME ORGANIZATION / PEOPLE</Typography><Typography variant="h6" fontWeight={750}>{tab==='overview'?'Overview':tab==='employees'?'Employee directory':'Salary reports'}</Typography></Box><Stack direction="row" spacing={1} alignItems="center"><IconButton aria-label="Notifications"><NotificationsNoneRoundedIcon/></IconButton><Divider orientation="vertical" flexItem sx={{ mx:1 }}/><Avatar sx={{ bgcolor:'#e5e7ff', color:'#3730a3', width:34,height:34 }}>HR</Avatar><Box><Typography fontSize={13} fontWeight={700}>HR Manager</Typography><Typography variant="caption" color="text.secondary">ACME Global</Typography></Box></Stack></Toolbar></AppBar>
      <Box sx={{ p:{xs:2,md:4}, maxWidth:1500, mx:'auto' }}>
        {error && <Alert severity="error" sx={{ mb:2 }} onClose={()=>setError('')}>{error}</Alert>}
        {profile ? <Box>
          <Button onClick={()=>setProfile(null)} sx={{ mb:2 }}>← Back to directory</Button>
          <Stack direction={{xs:'column',md:'row'}} justifyContent="space-between" alignItems={{md:'center'}} mb={3} spacing={2}>
            <Stack direction="row" spacing={2} alignItems="center"><Avatar sx={{ width:58,height:58,bgcolor:'#e8eaff',color:'#4338ca',fontSize:22 }}>{profile.first_name[0]}{profile.last_name[0]}</Avatar><Box><Typography variant="h4" fontWeight={800}>{profile.full_name}</Typography><Typography color="text.secondary">{profile.employee_number} · {profile.department} · {profile.country_code}</Typography></Box></Stack>
            <Button variant="contained" startIcon={<AddRoundedIcon/>} onClick={()=>setSelected(profile)}>Update salary</Button>
          </Stack>
          <Grid container spacing={2} mb={3}><Grid item xs={12} md={4}><StatCard title="Current salary" value={currencyFmt(profile.current_salary?.amount,profile.current_salary?.currency)} sub={profile.current_salary?.pay_frequency||'No salary'} icon={<AccountBalanceWalletRoundedIcon/>} tone="#4f46e5"/></Grid><Grid item xs={12} md={4}><StatCard title="Employment status" value={statusLabel[profile.employment_status]} sub="Current record" icon={<PeopleAltRoundedIcon/>} tone="#0d9488"/></Grid><Grid item xs={12} md={4}><StatCard title="Country" value={profile.country_code} sub={profile.email} icon={<PublicRoundedIcon/>} tone="#e18b35"/></Grid></Grid>
          <Paper sx={{ p:2.5 }}><Typography variant="h6" fontWeight={750} mb={2}>Salary history</Typography><TableContainer><Table><TableHead><TableRow><TableCell>Effective from</TableCell><TableCell>Effective to</TableCell><TableCell>Amount</TableCell><TableCell>Currency</TableCell><TableCell>Frequency</TableCell><TableCell>Status</TableCell></TableRow></TableHead><TableBody>{(profile.salary_records||[profile.current_salary].filter(Boolean) as Salary[]).map(s=><TableRow key={s!.id}><TableCell>{s!.effective_from}</TableCell><TableCell>{s!.effective_to||'—'}</TableCell><TableCell>{currencyFmt(s!.amount,s!.currency)}</TableCell><TableCell>{s!.currency}</TableCell><TableCell>{s!.pay_frequency}</TableCell><TableCell><Chip size="small" color={s!.effective_to?'default':'success'} label={s!.effective_to?'Historical':'Current'}/></TableCell></TableRow>)}</TableBody></Table></TableContainer></Paper>
        </Box> : tab==='overview' ? <>
          <Stack direction={{xs:'column',sm:'row'}} justifyContent="space-between" alignItems={{sm:'center'}} mb={3} spacing={1}><Box><Typography variant="h4" fontWeight={800} letterSpacing="-1px">Good morning, HR team</Typography><Typography color="text.secondary" mt={.5}>Here’s your organization’s compensation snapshot.</Typography></Box><Chip label="Synthetic demo data" color="info" variant="outlined"/></Stack>
          <Grid container spacing={2.2} mb={3}><Grid item xs={12} sm={6} lg={3}><StatCard title="Total employees" value={(summary?.employee_count??0).toLocaleString()} sub="Across all locations" icon={<PeopleAltRoundedIcon/>} tone="#4f46e5"/></Grid><Grid item xs={12} sm={6} lg={3}><StatCard title="Active employees" value={(summary?.active_employee_count??0).toLocaleString()} sub="Current workforce" icon={<AccountBalanceWalletRoundedIcon/>} tone="#0d9488"/></Grid><Grid item xs={12} sm={6} lg={3}><StatCard title="Countries" value={String(summary?.country_count??0)} sub="Global footprint" icon={<PublicRoundedIcon/>} tone="#e18b35"/></Grid><Grid item xs={12} sm={6} lg={3}><StatCard title="Departments" value={String(summary?.department_count??0)} sub="Business functions" icon={<BusinessRoundedIcon/>} tone="#7c3aed"/></Grid></Grid>
          <Grid container spacing={2.2}><Grid item xs={12} lg={7}><Card><CardContent sx={{p:2.5}}><Stack direction="row" justifyContent="space-between" mb={2}><Box><Typography variant="h6" fontWeight={750}>Headcount by department</Typography><Typography variant="body2" color="text.secondary">Distribution across the organization</Typography></Box><Chip label="10 departments" size="small"/></Stack>{Object.entries(summary?.employees_by_department||{}).sort((a,b)=>b[1]-a[1]).map(([name,count])=><Box key={name} mb={1.8}><Stack direction="row" justifyContent="space-between" mb={.6}><Typography variant="body2" fontWeight={600}>{name}</Typography><Typography variant="body2" color="text.secondary">{count.toLocaleString()}</Typography></Stack><Box sx={{ height:8,bgcolor:'#eef0f5',borderRadius:5,overflow:'hidden' }}><Box sx={{ height:'100%',width:`${count/Math.max(summary?.employee_count||1,1)*100*departmentOptions.length}%`,maxWidth:'100%',bgcolor:'#6366f1',borderRadius:5 }}/></Box></Box>)}</CardContent></Card></Grid>
          <Grid item xs={12} lg={5}><Card sx={{height:'100%'}}><CardContent sx={{p:2.5}}><Typography variant="h6" fontWeight={750}>Salary overview</Typography><Typography variant="body2" color="text.secondary" mb={2}>Average current salary by currency</Typography>{Object.entries(summary?.average_salary_by_currency||{}).map(([currency,avg])=><Stack key={currency} direction="row" alignItems="center" justifyContent="space-between" py={1.5} borderBottom="1px solid #eef0f4"><Box><Typography fontWeight={700}>{currency}</Typography><Typography variant="caption" color="text.secondary">{summary?.salary_count_by_currency[currency]?.toLocaleString()} records</Typography></Box><Typography fontWeight={750}>{currencyFmt(avg,currency)}</Typography></Stack>)}<Alert severity="info" sx={{mt:2}}>Currencies are shown separately. No unverified exchange rates are applied.</Alert></CardContent></Card></Grid></Grid>
          <Paper sx={{mt:3,p:2.5}}><Stack direction="row" justifyContent="space-between" alignItems="center"><Box><Typography variant="h6" fontWeight={750}>Recently added employees</Typography><Typography variant="body2" color="text.secondary">Browse employee records and salary details</Typography></Box><Button onClick={()=>setTab('employees')}>View directory →</Button></Stack><TableContainer sx={{mt:2}}><Table><TableHead><TableRow><TableCell>Employee</TableCell><TableCell>Department</TableCell><TableCell>Country</TableCell><TableCell>Current salary</TableCell><TableCell>Status</TableCell><TableCell/></TableRow></TableHead><TableBody>{(employees.length?employees.slice(0,5):[]).map(e=><EmployeeRow key={e.id} employee={e} onOpen={openProfile} onSalary={()=>setSelected(e)}/>)}</TableBody></Table></TableContainer></Paper>
        </> : tab==='employees' ? <>
          <Stack direction={{xs:'column',sm:'row'}} justifyContent="space-between" alignItems={{sm:'center'}} mb={3} spacing={1}><Box><Typography variant="h4" fontWeight={800}>Employee directory</Typography><Typography color="text.secondary">Search and manage employee salary information.</Typography></Box><Button variant="contained" startIcon={<AddRoundedIcon/>} onClick={()=>setSnack('Creating a new employee is not included in this initial UI; use the documented API endpoint.')}>Add employee</Button></Stack>
          <Paper sx={{p:2,mb:2}}><Grid container spacing={1.5} alignItems="center"><Grid item xs={12} md={4}><TextField value={search} onChange={e=>{setSearch(e.target.value);setPage(0)}} fullWidth size="small" placeholder="Search name, email or employee ID" InputProps={{startAdornment:<InputAdornment position="start"><SearchRoundedIcon fontSize="small"/></InputAdornment>}} /></Grid><Grid item xs={6} md={2}><FormControl fullWidth size="small"><Select displayEmpty value={country} onChange={e=>{setCountry(e.target.value);setPage(0)}}><MenuItem value="">All countries</MenuItem>{countryOptions.map(c=><MenuItem key={c} value={c}>{c}</MenuItem>)}</Select></FormControl></Grid><Grid item xs={6} md={2}><FormControl fullWidth size="small"><Select displayEmpty value={department} onChange={e=>{setDepartment(e.target.value);setPage(0)}}><MenuItem value="">All departments</MenuItem>{departmentOptions.map((d,i)=><MenuItem key={d} value={String(i+1)}>{d}</MenuItem>)}</Select></FormControl></Grid><Grid item xs={6} md={2}><FormControl fullWidth size="small"><Select displayEmpty value={status} onChange={e=>{setStatus(e.target.value);setPage(0)}}><MenuItem value="">All statuses</MenuItem><MenuItem value="active">Active</MenuItem><MenuItem value="on_leave">On leave</MenuItem><MenuItem value="inactive">Inactive</MenuItem></Select></FormControl></Grid><Grid item xs={6} md={2}><Button fullWidth onClick={()=>{setSearch('');setCountry('');setDepartment('');setStatus('');setPage(0)}}>Clear filters</Button></Grid></Grid></Paper>
          <Paper><TableContainer><Table><TableHead><TableRow><TableCell>Employee</TableCell><TableCell>Department</TableCell><TableCell>Country</TableCell><TableCell>Salary</TableCell><TableCell>Status</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead><TableBody>{loading?<TableRow><TableCell colSpan={6} align="center"><CircularProgress size={24}/></TableCell></TableRow>:employees.map(e=><EmployeeRow key={e.id} employee={e} onOpen={openProfile} onSalary={()=>setSelected(e)}/>)}{!loading&&employees.length===0&&<TableRow><TableCell colSpan={6} align="center">No employees match these filters.</TableCell></TableRow>}</TableBody></Table></TableContainer><TablePagination component="div" count={total} page={page} onPageChange={(_,p)=>setPage(p)} rowsPerPage={10} rowsPerPageOptions={[10]}/></Paper>
        </> : <>
          <Typography variant="h4" fontWeight={800} mb={1}>Salary reports</Typography><Typography color="text.secondary" mb={3}>Compare current salaries without mixing currencies.</Typography>
          <Paper sx={{p:2.5,mb:2}}><Stack direction={{xs:'column',sm:'row'}} justifyContent="space-between" alignItems={{sm:'center'}} spacing={2}><Box><Typography fontWeight={750}>Average salary by currency</Typography><Typography variant="body2" color="text.secondary">Current records, grouped by original currency</Typography></Box><FormControl sx={{minWidth:180}} size="small"><Select value={reportCurrency} onChange={e=>setReportCurrency(e.target.value)}><MenuItem value="all">All currencies</MenuItem>{Object.keys(summary?.average_salary_by_currency||{}).map(c=><MenuItem key={c} value={c}>{c}</MenuItem>)}</Select></FormControl></Stack><TableContainer sx={{mt:2}}><Table><TableHead><TableRow><TableCell>Currency</TableCell><TableCell>Current records</TableCell><TableCell>Average salary</TableCell><TableCell>Pay period</TableCell></TableRow></TableHead><TableBody>{reportRows.map(([c,avg])=><TableRow key={c}><TableCell><Chip label={c} size="small"/></TableCell><TableCell>{summary?.salary_count_by_currency[c]?.toLocaleString()}</TableCell><TableCell>{currencyFmt(avg,c)}</TableCell><TableCell>Mixed frequencies in demo data</TableCell></TableRow>)}</TableBody></Table></TableContainer></Paper>
          <Alert severity="info">Production reports should group by both currency and pay frequency. FX-converted comparisons should include the rate source and conversion date.</Alert>
        </>}
      </Box>
    </Box>
    <SalaryDialog employee={selected} onClose={()=>setSelected(null)} onSaved={onSalarySaved}/>
    <Snackbar open={!!snack} autoHideDuration={4500} onClose={()=>setSnack('')} message={snack}/>
  </Box>;
}

function EmployeeRow({ employee, onOpen, onSalary }: { employee: Employee; onOpen: (e: Employee) => void; onSalary: () => void }) {
  return <TableRow hover><TableCell><Stack direction="row" spacing={1.3} alignItems="center"><Avatar sx={{width:34,height:34,bgcolor:'#edf0ff',color:'#4338ca',fontSize:12,fontWeight:700}}>{employee.first_name[0]}{employee.last_name[0]}</Avatar><Box><Typography fontWeight={700} fontSize={13.5}>{employee.full_name}</Typography><Typography variant="caption" color="text.secondary">{employee.employee_number} · {employee.email}</Typography></Box></Stack></TableCell><TableCell>{employee.department}</TableCell><TableCell><Chip size="small" label={employee.country_code} variant="outlined"/></TableCell><TableCell><Typography fontWeight={700} fontSize={13.5}>{currencyFmt(employee.current_salary?.amount,employee.current_salary?.currency)}</Typography><Typography variant="caption" color="text.secondary">{employee.current_salary?.pay_frequency}</Typography></TableCell><TableCell><Chip size="small" label={statusLabel[employee.employment_status]} color={employee.employment_status==='active'?'success':employee.employment_status==='inactive'?'default':'warning'}/></TableCell><TableCell align="right"><Button size="small" onClick={()=>onOpen(employee)}>View</Button><Button size="small" onClick={onSalary}>Salary</Button></TableCell></TableRow>;
}
