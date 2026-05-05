import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BookText, AlertCircle, Eye, EyeOff, Lock, Feather, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore(state => state.login);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data.token, {
        id: response.data.id,
        email: response.data.email,
        displayName: response.data.displayName,
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const focusInput = (e) => {
    e.target.style.borderColor = '#4648D4';
    e.target.style.boxShadow = '0 0 0 4px rgba(70,72,212,0.08)';
  };
  const blurInput = (e) => {
    e.target.style.borderColor = 'rgba(0,0,0,0.12)';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div style={S.page}>
      <style>{CSS}</style>

      {/* LEFT: Brand panel */}
      <div style={S.brandPanel} className="login-brand">
        <div className="orb orb1" /><div className="orb orb2" /><div className="orb orb3" />
        <div className="dots" />
        <div style={S.brandInner}>
          <div style={S.logoBox}><BookText size={34} color="#fff" /></div>
          <div>
            <h1 style={S.brandTitle}>Sanctuary</h1>
            <p style={S.brandSub}>Your private space to reflect, grow, and remember what matters most.</p>
          </div>
          <div className="journalFloat" style={S.journalWrap}>
            <div style={S.journalCard}>
              {[78,55,90,45,68,38].map((w,i)=><div key={i} style={{...S.line,width:`${w}%`}}/>)}
              <div style={S.fold}/>
            </div>
            <div className="pen"><Feather size={28} color="rgba(255,255,255,0.85)"/></div>
            <Sparkles size={16} color="#FDE68A" className="sp1" style={{position:'absolute',bottom:-4,left:-8}}/>
            <Sparkles size={12} color="rgba(255,255,255,0.6)" className="sp2" style={{position:'absolute',top:4,right:36}}/>
          </div>
          <div style={S.quote}>
            <p style={S.quoteText}>"The act of writing is the act of discovering what you believe."</p>
            <p style={S.quoteAuthor}>— David Hare</p>
          </div>
          <div style={S.statsRow}>
            {[['10K+','Writers'],['1M+','Entries'],['100%','Private']].map(([n,l])=>(
              <div key={l} style={S.stat}>
                <span style={S.statNum}>{n}</span>
                <span style={S.statLbl}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT: Form panel */}
      <div style={S.formPanel}>
        <div style={S.formScroll}>
          <div style={S.formBox}>
            {/* Mobile logo (shown <900px) */}
            <div style={S.mobileLogo} className="mobile-logo">
              <div style={S.mobileLogoIcon}><BookText size={16} color="#fff"/></div>
              <span style={S.mobileLogoText}>Sanctuary</span>
            </div>

            <h2 style={S.title}>Welcome back</h2>
            <p style={S.subtitle}>Sign in to continue your journey.</p>

            {error && (
              <div style={S.errorBox}>
                <AlertCircle size={14} color="#be123c" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={S.form}>
              <div style={S.field}>
                <label style={S.label}>EMAIL ADDRESS</label>
                <input type="email" required value={email}
                  onChange={e=>setEmail(e.target.value)} placeholder="name@example.com"
                  style={S.input} onFocus={focusInput} onBlur={blurInput}/>
              </div>
              <div style={S.field}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                  <label style={S.label}>PASSWORD</label>
                  <button type="button" style={S.forgotBtn}>Forgot?</button>
                </div>
                <div style={{position:'relative'}}>
                  <input type={showPassword?'text':'password'} required value={password}
                    onChange={e=>setPassword(e.target.value)} placeholder="••••••••"
                    style={{...S.input,paddingRight:44}} onFocus={focusInput} onBlur={blurInput}/>
                  <button type="button" onClick={()=>setShowPassword(p=>!p)} style={S.eyeBtn}>
                    {showPassword?<EyeOff size={15}/>:<Eye size={15}/>}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={isLoading} style={S.submitBtn}>
                {isLoading
                  ?<><span className="spinner"/> Signing in...</>
                  :<><Lock size={14}/> Sign In Securely</>}
              </button>
            </form>

            <p style={S.switchText}>
              Don't have an account?{' '}
              <Link to="/register" style={S.switchLink}>Create one free</Link>
            </p>
            <div style={S.trust}><Lock size={11}/><span>End-to-end encrypted · Your thoughts stay private</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Styles ── */
const S = {
  page: {
    display:'flex', height:'100vh', overflow:'hidden',
    fontFamily:"'Inter',system-ui,sans-serif",
  },
  /* Brand */
  brandPanel: {
    position:'relative', width:'55%', height:'100vh',
    display:'flex', alignItems:'center', justifyContent:'center',
    overflow:'hidden', flexShrink:0,
    background:'linear-gradient(135deg,#2D30C4 0%,#4648D4 52%,#7263F3 100%)',
  },
  brandInner: {
    position:'relative', zIndex:2,
    display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center',
    gap:20, padding:'32px 40px', width:'100%', maxWidth:480,
  },
  logoBox: {
    width:64,height:64,borderRadius:18,
    background:'rgba(255,255,255,0.15)',backdropFilter:'blur(12px)',
    border:'1px solid rgba(255,255,255,0.25)',
    display:'flex',alignItems:'center',justifyContent:'center',
    boxShadow:'0 8px 32px rgba(0,0,0,0.2)',
  },
  brandTitle:{fontSize:34,fontWeight:900,color:'#fff',margin:0,letterSpacing:'-0.5px',lineHeight:1.1},
  brandSub:{fontSize:14,color:'rgba(255,255,255,0.7)',margin:'6px 0 0',lineHeight:1.6,maxWidth:320},
  journalWrap:{position:'relative',display:'flex',alignItems:'center',justifyContent:'center',width:170,height:190},
  journalCard:{
    position:'relative',width:138,height:160,
    background:'rgba(255,255,255,0.12)',backdropFilter:'blur(10px)',
    border:'1px solid rgba(255,255,255,0.25)',borderRadius:18,
    padding:'16px 18px',display:'flex',flexDirection:'column',gap:9,
    boxShadow:'0 12px 40px rgba(0,0,0,0.25)',
  },
  line:{height:5,background:'rgba(255,255,255,0.35)',borderRadius:8},
  fold:{position:'absolute',top:0,right:0,width:24,height:24,background:'rgba(255,255,255,0.15)',borderBottomLeftRadius:10,borderTopRightRadius:18},
  quote:{
    background:'rgba(255,255,255,0.1)',backdropFilter:'blur(8px)',
    border:'1px solid rgba(255,255,255,0.2)',borderRadius:16,
    padding:'14px 18px',maxWidth:320,width:'100%',
  },
  quoteText:{color:'rgba(255,255,255,0.9)',fontSize:13,fontStyle:'italic',lineHeight:1.6,margin:0},
  quoteAuthor:{color:'rgba(255,255,255,0.5)',fontSize:10,fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase',margin:'8px 0 0'},
  statsRow:{display:'flex',gap:36},
  stat:{display:'flex',flexDirection:'column',alignItems:'center',gap:2},
  statNum:{fontSize:20,fontWeight:900,color:'#fff'},
  statLbl:{fontSize:9,color:'rgba(255,255,255,0.55)',fontWeight:700,letterSpacing:'0.14em',textTransform:'uppercase'},
  /* Form */
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
  formBox:{width:'100%',maxWidth:400},
  mobileLogo:{display:'none',alignItems:'center',gap:10,marginBottom:24},
  mobileLogoIcon:{width:32,height:32,background:'#4648D4',borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center'},
  mobileLogoText:{fontSize:16,fontWeight:900,color:'#1B1B23',letterSpacing:'-0.3px'},
  title:{fontSize:26,fontWeight:900,color:'#1B1B23',margin:0,letterSpacing:'-0.4px'},
  subtitle:{fontSize:13,color:'#64748B',margin:'5px 0 0',fontWeight:500},
  errorBox:{marginTop:16,padding:'11px 14px',background:'#FFF1F2',border:'1px solid #FECDD3',borderRadius:12,color:'#be123c',display:'flex',alignItems:'center',gap:8,fontSize:13,fontWeight:600},
  form:{marginTop:22,display:'flex',flexDirection:'column',gap:16},
  field:{display:'flex',flexDirection:'column'},
  label:{fontSize:10,fontWeight:800,color:'rgba(100,116,139,0.65)',letterSpacing:'0.16em',textTransform:'uppercase',marginBottom:6},
  input:{
    width:'100%',boxSizing:'border-box',
    padding:'12px 15px',fontSize:14,fontWeight:500,color:'#1B1B23',
    background:'#fff',border:'1.5px solid rgba(0,0,0,0.12)',borderRadius:13,
    outline:'none',transition:'border-color 0.2s,box-shadow 0.2s',
    fontFamily:'inherit',boxShadow:'0 1px 3px rgba(0,0,0,0.04)',
  },
  eyeBtn:{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#94a3b8',padding:4,display:'flex'},
  forgotBtn:{background:'none',border:'none',cursor:'pointer',color:'#4648D4',fontSize:11,fontWeight:700,padding:0},
  submitBtn:{
    width:'100%',padding:'13px',
    background:'#4648D4',color:'#fff',border:'none',borderRadius:13,cursor:'pointer',
    fontSize:14,fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center',gap:7,
    boxShadow:'0 4px 18px rgba(70,72,212,0.3)',transition:'opacity 0.15s',marginTop:4,fontFamily:'inherit',
  },
  switchText:{marginTop:22,textAlign:'center',fontSize:13,color:'#64748B',fontWeight:500},
  switchLink:{color:'#4648D4',fontWeight:800,textDecoration:'none'},
  trust:{marginTop:14,display:'flex',alignItems:'center',justifyContent:'center',gap:6,color:'rgba(100,116,139,0.45)',fontSize:11},
};

const CSS = `
  .dots{position:absolute;inset:0;opacity:.07;background-image:radial-gradient(circle,rgba(255,255,255,.9) 1px,transparent 1px);background-size:36px 36px;}
  .orb{position:absolute;border-radius:50%;filter:blur(56px);}
  .orb1{width:260px;height:260px;background:rgba(255,255,255,.18);top:-70px;left:-60px;animation:orbF 8s ease-in-out infinite;}
  .orb2{width:210px;height:210px;background:rgba(180,160,255,.2);bottom:-50px;right:-50px;animation:orbF 10s ease-in-out 2s infinite;}
  .orb3{width:130px;height:130px;background:rgba(200,220,255,.18);top:45%;left:6%;animation:orbF 7s ease-in-out 4s infinite;}
  .journalFloat{animation:jFloat 5s ease-in-out infinite;}
  .pen{position:absolute;top:-20px;right:-12px;animation:penSwing 2.8s ease-in-out infinite;}
  .sp1{animation:sparkle 2.4s ease-in-out infinite;}
  .sp2{animation:sparkle 3.1s ease-in-out 1s infinite;}
  .spinner{display:inline-block;width:14px;height:14px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;}
  @keyframes orbF{0%,100%{transform:translateY(0);}50%{transform:translateY(-18px);}}
  @keyframes jFloat{0%,100%{transform:translateY(0);}50%{transform:translateY(-12px);}}
  @keyframes penSwing{0%,100%{transform:rotate(-18deg);}50%{transform:rotate(-10deg) translate(4px,-5px);}}
  @keyframes sparkle{0%,100%{opacity:.4;transform:scale(.85);}50%{opacity:1;transform:scale(1.2);}}
  @keyframes spin{to{transform:rotate(360deg);}}

  /* Responsive */
  @media(max-width:860px){
    .login-brand{display:none !important;}
    .mobile-logo{display:flex !important;}
  }
`;

export default Login;
