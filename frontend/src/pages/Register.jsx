import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BookText, AlertCircle, Eye, EyeOff, Sparkles, Feather, CheckCircle2, Shield } from 'lucide-react';
import api from '../services/api';

const PasswordStrength = ({ password }) => {
  const checks = [
    { label: 'At least 8 characters', ok: password.length >= 8 },
    { label: 'Contains a number',     ok: /\d/.test(password) },
    { label: 'Contains uppercase',    ok: /[A-Z]/.test(password) },
  ];
  if (!password) return null;
  return (
    <div style={{ marginTop:7, display:'flex', flexDirection:'column', gap:3 }}>
      {checks.map(c => (
        <div key={c.label} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11.5,
          color: c.ok ? '#059669' : 'rgba(100,116,139,0.5)', transition:'color 0.2s' }}>
          <CheckCircle2 size={11} color={c.ok ? '#10b981' : '#cbd5e1'} />
          {c.label}
        </div>
      ))}
    </div>
  );
};

const Register = () => {
  const [formData, setFormData] = useState({ displayName:'', email:'', password:'', confirmPassword:'' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [error,        setError]        = useState('');
  const [isLoading,    setIsLoading]    = useState(false);
  const navigate = useNavigate();

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match.');
    setIsLoading(true); setError('');
    try {
      await api.post('/auth/register', formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setIsLoading(false); }
  };

  const passwordsMatch    = formData.confirmPassword && formData.password === formData.confirmPassword;
  const passwordsMismatch = formData.confirmPassword && formData.password !== formData.confirmPassword;

  const focusInput = (e) => { e.target.style.borderColor='#4648D4'; e.target.style.boxShadow='0 0 0 4px rgba(70,72,212,0.08)'; };
  const blurInput  = (e) => { e.target.style.borderColor='rgba(0,0,0,0.12)'; e.target.style.boxShadow='none'; };

  const confirmBorder = passwordsMismatch ? '#fca5a5' : passwordsMatch ? '#6ee7b7' : 'rgba(0,0,0,0.12)';
  const confirmFocus  = passwordsMismatch ? '#f87171'  : passwordsMatch ? '#34d399' : '#4648D4';

  return (
    <div style={S.page}>
      <style>{CSS}</style>

      {/* LEFT: Form panel */}
      <div style={S.formPanel}>
        <div style={S.formScroll}>
          <div style={S.formBox}>

            {/* Mobile logo */}
            <div style={S.mobileLogo} className="mobile-logo">
              <div style={S.mobileLogoIcon}><BookText size={16} color="#fff"/></div>
              <span style={S.mobileLogoText}>Sanctuary</span>
            </div>

            <span style={S.badge}>Free Forever</span>
            <h2 style={S.title}>Create your sanctuary</h2>
            <p style={S.subtitle}>Start your private journaling journey today.</p>

            {error && (
              <div style={S.errorBox}>
                <AlertCircle size={14} color="#be123c"/>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={S.form}>

              <div style={S.field}>
                <label style={S.label}>DISPLAY NAME</label>
                <input type="text" name="displayName" required value={formData.displayName} onChange={handleChange}
                  placeholder="Your name" style={S.input} onFocus={focusInput} onBlur={blurInput}/>
              </div>

              <div style={S.field}>
                <label style={S.label}>EMAIL ADDRESS</label>
                <input type="email" name="email" required value={formData.email} onChange={handleChange}
                  placeholder="you@example.com" style={S.input} onFocus={focusInput} onBlur={blurInput}/>
              </div>

              <div style={S.field}>
                <label style={S.label}>PASSWORD</label>
                <div style={{position:'relative'}}>
                  <input type={showPassword?'text':'password'} name="password" required value={formData.password} onChange={handleChange}
                    placeholder="Create a strong password" style={{...S.input,paddingRight:44}}
                    onFocus={focusInput} onBlur={blurInput}/>
                  <button type="button" onClick={()=>setShowPassword(p=>!p)} style={S.eyeBtn}>
                    {showPassword?<EyeOff size={15}/>:<Eye size={15}/>}
                  </button>
                </div>
                <PasswordStrength password={formData.password}/>
              </div>

              <div style={S.field}>
                <label style={S.label}>CONFIRM PASSWORD</label>
                <div style={{position:'relative'}}>
                  <input type={showConfirm?'text':'password'} name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange}
                    placeholder="Repeat your password"
                    style={{...S.input,paddingRight:44,borderColor:confirmBorder}}
                    onFocus={e=>{e.target.style.borderColor=confirmFocus;e.target.style.boxShadow='0 0 0 4px rgba(70,72,212,0.08)';}}
                    onBlur={e=>{e.target.style.borderColor=confirmBorder;e.target.style.boxShadow='none';}}/>
                  <button type="button" onClick={()=>setShowConfirm(p=>!p)} style={S.eyeBtn}>
                    {showConfirm?<EyeOff size={15}/>:<Eye size={15}/>}
                  </button>
                </div>
                {passwordsMatch && (
                  <div style={{display:'flex',alignItems:'center',gap:5,marginTop:6,color:'#059669',fontSize:12,fontWeight:600}}>
                    <CheckCircle2 size={11} color="#10b981"/> Passwords match
                  </div>
                )}
              </div>

              <button type="submit" disabled={isLoading} style={S.submitBtn}>
                {isLoading
                  ?<><span className="spinner"/> Creating account...</>
                  :<><Sparkles size={14}/> Create My Sanctuary</>}
              </button>
            </form>

            <p style={S.switchText}>
              Already have an account?{' '}
              <Link to="/login" style={S.switchLink}>Sign in</Link>
            </p>
            <div style={S.trust}><Shield size={11}/><span>No credit card · Free forever · Private by design</span></div>
          </div>
        </div>
      </div>

      {/* RIGHT: Brand panel */}
      <div style={S.brandPanel} className="reg-brand">
        <div className="orb orb1"/><div className="orb orb2"/><div className="orb orb3"/>
        <div className="dots"/>

        <div style={S.brandInner}>
          <div style={S.logoBox}><BookText size={34} color="#fff"/></div>
          <div>
            <h2 style={S.brandTitle}>Begin your story</h2>
            <p style={S.brandSub}>Join thousands of writers who capture their most meaningful moments.</p>
          </div>

          {/* Animated Journal */}
          <div className="journalFloat" style={S.journalWrap}>
            <div style={S.journalCard}>
              {[78,55,90,45,68,38].map((w,i)=><div key={i} style={{...S.line,width:`${w}%`}}/>)}
              <div style={S.fold}/>
            </div>
            <div className="pen"><Feather size={28} color="rgba(255,255,255,0.85)"/></div>
            <Sparkles size={16} color="#FDE68A" className="sp1" style={{position:'absolute',bottom:-4,left:-8}}/>
            <Sparkles size={12} color="rgba(255,255,255,0.6)" className="sp2" style={{position:'absolute',top:4,right:36}}/>
          </div>

          {/* Features */}
          <div style={S.featureList}>
            {[
              {icon:Shield,   title:'End-to-End Encrypted',       desc:'Your entries are encrypted before leaving your device.'},
              {icon:Sparkles, title:'Writing Streaks & Insights',  desc:'Stay consistent with streak tracking and analytics.'},
              {icon:Feather,  title:'Beautiful Writing Experience', desc:'Distraction-free editor built for deep reflection.'},
            ].map(({icon:Icon,title,desc})=>(
              <div key={title} style={S.featureItem}>
                <div style={S.featureIcon}><Icon size={15} color="#fff"/></div>
                <div>
                  <p style={S.featureTitle}>{title}</p>
                  <p style={S.featureDesc}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Styles ── */
const S = {
  page:{
    display:'flex', height:'100vh', overflow:'hidden',
    fontFamily:"'Inter',system-ui,sans-serif",
  },
  /* Form panel */
  formPanel:{
    flex:1, height:'100vh', display:'flex',
    alignItems:'center', justifyContent:'center',
    background:'#F8F9FB', overflow:'hidden',
  },
  formScroll:{
    width:'100%', height:'100%', overflowY:'auto',
    display:'flex', alignItems:'center', justifyContent:'center',
    padding:'24px 32px', boxSizing:'border-box',
  },
  formBox:{ width:'100%', maxWidth:420 },
  mobileLogo:{display:'none',alignItems:'center',gap:10,marginBottom:20},
  mobileLogoIcon:{width:32,height:32,background:'#4648D4',borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center'},
  mobileLogoText:{fontSize:16,fontWeight:900,color:'#1B1B23',letterSpacing:'-0.3px'},
  badge:{display:'inline-block',background:'rgba(70,72,212,0.1)',color:'#4648D4',fontSize:10,fontWeight:800,padding:'3px 10px',borderRadius:999,letterSpacing:'0.14em',textTransform:'uppercase',marginBottom:12},
  title:{fontSize:26,fontWeight:900,color:'#1B1B23',margin:0,letterSpacing:'-0.4px',lineHeight:1.2},
  subtitle:{fontSize:13,color:'#64748B',margin:'5px 0 0',fontWeight:500},
  errorBox:{marginTop:14,padding:'11px 14px',background:'#FFF1F2',border:'1px solid #FECDD3',borderRadius:12,color:'#be123c',display:'flex',alignItems:'center',gap:8,fontSize:13,fontWeight:600},
  form:{marginTop:18,display:'flex',flexDirection:'column',gap:14},
  field:{display:'flex',flexDirection:'column'},
  label:{fontSize:10,fontWeight:800,color:'rgba(100,116,139,0.65)',letterSpacing:'0.16em',textTransform:'uppercase',marginBottom:6},
  input:{
    width:'100%',boxSizing:'border-box',
    padding:'11px 14px',fontSize:14,fontWeight:500,color:'#1B1B23',
    background:'#fff',border:'1.5px solid rgba(0,0,0,0.12)',borderRadius:12,
    outline:'none',transition:'border-color 0.2s,box-shadow 0.2s',
    fontFamily:'inherit',boxShadow:'0 1px 3px rgba(0,0,0,0.04)',
  },
  eyeBtn:{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#94a3b8',padding:3,display:'flex'},
  submitBtn:{
    width:'100%',padding:'13px',
    background:'#4648D4',color:'#fff',border:'none',borderRadius:12,cursor:'pointer',
    fontSize:14,fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center',gap:7,
    boxShadow:'0 4px 18px rgba(70,72,212,0.3)',transition:'opacity 0.15s',marginTop:2,fontFamily:'inherit',
  },
  switchText:{marginTop:18,textAlign:'center',fontSize:13,color:'#64748B',fontWeight:500},
  switchLink:{color:'#4648D4',fontWeight:800,textDecoration:'none'},
  trust:{marginTop:12,display:'flex',alignItems:'center',justifyContent:'center',gap:6,color:'rgba(100,116,139,0.45)',fontSize:11},
  /* Brand panel */
  brandPanel:{
    position:'relative', width:'48%', height:'100vh',
    display:'flex', alignItems:'center', justifyContent:'center',
    overflow:'hidden', flexShrink:0,
    background:'linear-gradient(135deg,#2A2DC0 0%,#4648D4 52%,#7B6EF5 100%)',
  },
  brandInner:{
    position:'relative',zIndex:2,
    display:'flex',flexDirection:'column',alignItems:'center',textAlign:'center',
    gap:18,padding:'28px 36px',width:'100%',maxWidth:460,
  },
  logoBox:{
    width:62,height:62,borderRadius:17,
    background:'rgba(255,255,255,0.15)',backdropFilter:'blur(12px)',
    border:'1px solid rgba(255,255,255,0.25)',
    display:'flex',alignItems:'center',justifyContent:'center',
    boxShadow:'0 8px 28px rgba(0,0,0,0.2)',
  },
  brandTitle:{fontSize:30,fontWeight:900,color:'#fff',margin:0,letterSpacing:'-0.5px',lineHeight:1.15},
  brandSub:{fontSize:13.5,color:'rgba(255,255,255,0.68)',margin:'6px 0 0',lineHeight:1.6,maxWidth:300},
  journalWrap:{position:'relative',display:'flex',alignItems:'center',justifyContent:'center',width:160,height:180},
  journalCard:{
    position:'relative',width:130,height:155,
    background:'rgba(255,255,255,0.12)',backdropFilter:'blur(10px)',
    border:'1px solid rgba(255,255,255,0.25)',borderRadius:17,
    padding:'16px 18px',display:'flex',flexDirection:'column',gap:8,
    boxShadow:'0 12px 36px rgba(0,0,0,0.25)',
  },
  line:{height:5,background:'rgba(255,255,255,0.35)',borderRadius:7},
  fold:{position:'absolute',top:0,right:0,width:22,height:22,background:'rgba(255,255,255,0.15)',borderBottomLeftRadius:10,borderTopRightRadius:17},
  featureList:{display:'flex',flexDirection:'column',gap:14,width:'100%',textAlign:'left'},
  featureItem:{display:'flex',alignItems:'flex-start',gap:12},
  featureIcon:{width:34,height:34,borderRadius:10,background:'rgba(255,255,255,0.14)',border:'1px solid rgba(255,255,255,0.2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0},
  featureTitle:{fontSize:13,fontWeight:700,color:'#fff',margin:0,lineHeight:1.3},
  featureDesc:{fontSize:11.5,color:'rgba(255,255,255,0.55)',margin:'3px 0 0',lineHeight:1.55},
};

const CSS = `
  .dots{position:absolute;inset:0;opacity:.07;background-image:radial-gradient(circle,rgba(255,255,255,.9) 1px,transparent 1px);background-size:36px 36px;}
  .orb{position:absolute;border-radius:50%;filter:blur(55px);}
  .orb1{width:240px;height:240px;background:rgba(200,180,255,.2);top:-70px;right:-50px;animation:orbF 8s ease-in-out infinite;}
  .orb2{width:190px;height:190px;background:rgba(150,180,255,.18);bottom:-40px;left:-40px;animation:orbF 11s ease-in-out 3s infinite;}
  .orb3{width:110px;height:110px;background:rgba(255,255,255,.15);top:42%;left:8%;animation:orbF 7s ease-in-out 1.5s infinite;}
  .journalFloat{animation:jFloat 5s ease-in-out infinite;}
  .pen{position:absolute;top:-18px;right:-10px;animation:penSwing 2.8s ease-in-out infinite;}
  .sp1{animation:sparkle 2.4s ease-in-out infinite;}
  .sp2{animation:sparkle 3.1s ease-in-out 1s infinite;}
  .spinner{display:inline-block;width:14px;height:14px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;}
  @keyframes orbF{0%,100%{transform:translateY(0);}50%{transform:translateY(-18px);}}
  @keyframes jFloat{0%,100%{transform:translateY(0);}50%{transform:translateY(-12px);}}
  @keyframes penSwing{0%,100%{transform:rotate(-18deg);}50%{transform:rotate(-10deg) translate(4px,-5px);}}
  @keyframes sparkle{0%,100%{opacity:.4;transform:scale(.85);}50%{opacity:1;transform:scale(1.2);}}
  @keyframes spin{to{transform:rotate(360deg);}}

  /* Hide brand panel on small screens, show mobile logo */
  @media(max-width:860px){
    .reg-brand{display:none !important;}
    .mobile-logo{display:flex !important;}
  }
`;

export default Register;
