import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/menu.css';

function Menu() {
  const navigate = useNavigate();
  
  // Initialize formData from localStorage
  const [formData, setFormData] = useState(() => {
    try {
      const savedFormData = localStorage.getItem('menuFormData');
      return savedFormData ? JSON.parse(savedFormData) : {
        assured: '',
        address: '',
        cocNumber: '',
        orNumber: '',
        policyNumber: '',
        dateIssued: '',
        dateReceived: '',
        agent: '',
        subAgent: '',
        region: '',
        insuranceFromDate: '',
        insuranceFromTime: '12:00',
        insuranceToDate: '',
        insuranceToTime: '12:00',
        invoiceNumber: '',
        cType: '',
        model: '',
        make: '',
        bodyType: '',
        color: '',
        mvFileNo: '',
        plateNo: '',
        serialChassisNo: '',
        motorNo: '',
        authorizedCapacity: '',
        unladenWeight: '',
        weightClass: '',
      };
    } catch (error) {
      return {
        assured: '',
        address: '',
        cocNumber: '',
        orNumber: '',
        policyNumber: '',
        dateIssued: '',
        dateReceived: '',
        agent: '',
        subAgent: '',
        region: '',
        insuranceFromDate: '',
        insuranceFromTime: '12:00',
        insuranceToDate: '',
        insuranceToTime: '12:00',
        invoiceNumber: '',
        cType: '',
        model: '',
        make: '',
        bodyType: '',
        color: '',
        mvFileNo: '',
        plateNo: '',
        serialChassisNo: '',
        motorNo: '',
        authorizedCapacity: '',
        unladenWeight: '',
        weightClass: '',
      };
    }
  });

  // Initialize currentStep from localStorage
  const [currentStep, setCurrentStep] = useState(() => {
    try {
      const savedStep = localStorage.getItem('menuCurrentStep');
      return savedStep ? parseInt(savedStep) : 1;
    } catch (error) {
      return 1;
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [clearFormConfirm, setClearFormConfirm] = useState(false);
  const [ratesData, setRatesData] = useState(() => {
    try {
      const savedRatesData = localStorage.getItem('menuRatesData');
      return savedRatesData ? JSON.parse(savedRatesData) : {
        premium: '',
        otherCharges: ''
      };
    } catch (error) {
      return {
        premium: '',
        otherCharges: ''
      };
    }
  });

  // Save formData to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('menuFormData', JSON.stringify(formData));
  }, [formData]);

  // Save currentStep to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('menuCurrentStep', currentStep.toString());
  }, [currentStep]);

  // Save ratesData to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('menuRatesData', JSON.stringify(ratesData));
  }, [ratesData]);

  const calculateRates = () => {
    const premium = parseFloat(ratesData.premium) || 0;
    const docStamps = premium * 0.125; // 12.5%
    const eVat = premium * 0.12; // 12%
    const lgt = premium * 0.005; // 0.5%
    const authFee = 50.40;
    const otherCharges = parseFloat(ratesData.otherCharges) || 0;
    const total = premium + docStamps + eVat + lgt + authFee + otherCharges;

    return {
      premium,
      docStamps,
      eVat,
      lgt,
      authFee,
      otherCharges,
      total
    };
  };

  const rates = calculateRates();

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Fields that should be uppercase on Info page
    const uppercaseFields = ['assured', 'address', 'model', 'make', 'bodyType', 'color', 'mvFileNo', 'plateNo', 'serialChassisNo', 'motorNo'];
    const finalValue = uppercaseFields.includes(name) ? value.toUpperCase() : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));
  };

  const handleBlur = (e) => {
    // Intentionally empty - touched state tracking not needed
  };

  const handleBack = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Clear menu access flag when going back
    sessionStorage.removeItem('menuAccessGranted');
    navigate('/records');
  };

  const handleStepClick = (stepNumber) => {
    if (stepNumber < currentStep) {
      setCurrentStep(stepNumber);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentStep === 2) {
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentStep === 3) {
      // Prevent multiple submissions
      if (isSubmitting) return;
      
      setIsSubmitting(true);
      
      try {
        const policyData = {
          assured: formData.assured || '',
          address: formData.address || '',
          coc_number: formData.cocNumber || '',
          or_number: formData.orNumber || '',
          policy_number: formData.policyNumber || '',
          policy_type: formData.cType || '',
          policy_year: formData.year ? parseInt(formData.year) : new Date().getFullYear(),
          date_issued: formData.dateIssued || null,  
          date_received: formData.dateReceived || null,
          insurance_from_date: formData.insuranceFromDate || null,
          insurance_to_date: formData.insuranceToDate || null,
          model: formData.model || '',
          make: formData.make || '',
          body_type: formData.bodyType || '',
          color: formData.color || '',
          mv_file_no: formData.mvFileNo || '',
          plate_no: formData.plateNo || '',
          chassis_no: formData.serialChassisNo || '',
          motor_no: formData.motorNo || '',
          premium: parseFloat(ratesData.premium) || 0,
          other_charges: parseFloat(ratesData.otherCharges) || 0,
          auth_fee: 50.40
        };

        const username = localStorage.getItem('user');
        const adminId = localStorage.getItem('adminId');
        const response = await fetch(`${process.env.REACT_APP_API_URL}/policies`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-username': username,
            'x-admin-id': adminId
          },
          body: JSON.stringify(policyData)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('API Error Response:', errorData);
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          console.log('Policy saved to database:', result);
          setIsSubmitting(false);
          showToast('Form submitted successfully!', 'success');
          
          // Clear localStorage
          localStorage.removeItem('menuFormData');
          localStorage.removeItem('menuCurrentStep');
          localStorage.removeItem('menuRatesData');
          
          // Clear menu access flag
          sessionStorage.removeItem('menuAccessGranted');
          
          // Redirect after 2 seconds
          setTimeout(() => {
            navigate('/records');
          }, 2000);
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        console.error('Error submitting form:', error);
        setIsSubmitting(false);
        showToast('Error submitting form. Please try again.', 'error');
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleClearForm = () => {
    if (!clearFormConfirm) {
      showToast('Click Clear Form again to confirm', 'warning');
      setClearFormConfirm(true);
      setTimeout(() => setClearFormConfirm(false), 3000); // Reset after 3 seconds
    } else {
      const emptyFormData = {
        assured: '',
        address: '',
        cocNumber: '',
        orNumber: '',
        policyNumber: '',
        year: '',
        dateIssued: '',
        dateReceived: '',
        agent: '',
        subAgent: '',
        region: '',
        insuranceFromDate: '',
        insuranceFromTime: '12:00',
        insuranceToDate: '',
        insuranceToTime: '12:00',
        invoiceNumber: '',
        cType: '',
        model: '',
        make: '',
        bodyType: '',
        color: '',
        mvFileNo: '',
        plateNo: '',
        serialChassisNo: '',
        motorNo: '',
        authorizedCapacity: '',
        unladenWeight: '',
        weightClass: '',
      };
      setFormData(emptyFormData);
      localStorage.removeItem('menuFormData');
      showToast('Form cleared successfully', 'success');
      setClearFormConfirm(false);
    }
  };

  // Check Quick Reference completion (only fields that count toward completion)
  const isQuickReferenceComplete = () => {
    return formData.assured && formData.address && formData.cocNumber && formData.orNumber;
  };

  // Check section completion
  const isPolicyInfoComplete = () => {
    return formData.cType && formData.cType !== 'Select Type' && 
           formData.policyNumber && 
           formData.year && formData.year !== 'Select' && 
           formData.dateIssued && 
           formData.dateReceived;
  };

  const isInsurancePeriodComplete = () => {
    return formData.insuranceFromDate && formData.insuranceToDate;
  };

  const isVehicleDetailsComplete = () => {
    return formData.model && formData.make && formData.bodyType && formData.color && formData.plateNo && formData.serialChassisNo && formData.motorNo;
  };

  // Calculate overall form completion percentage based on Quick Reference only
  const getFormCompletionPercentage = () => {
    return isQuickReferenceComplete() ? 100 : 0;
  };

  const completionPercentage = getFormCompletionPercentage();

  const stepTransitionStyle = {
    animation: 'fadeIn 0.4s ease-in-out',
    transition: 'opacity 0.4s ease-in-out'
  };

  const inputBaseStyle = {
    width: '100%',
    padding: '11px 14px',
    border: '1.5px solid #9ca3af',
    borderRadius: '8px',
    fontSize: '13px',
    outline: 'none',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    backgroundColor: '#ffffff'
  };

  return (
    
    <div style={{minHeight: '100vh', backgroundColor: '#1E6B47', padding: '0'}}>
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideOutUp {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(-20px);
          }
        }
      `}</style>

      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '16px 24px',
          backgroundColor: toast.type === 'success' ? '#2D5016' : '#dc2626',
          color: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          animation: 'slideInDown 0.4s ease-out',
          zIndex: 1000,
          maxWidth: '400px',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            <span style={{fontSize: '18px'}}>
              {toast.type === 'success' ? '✓' : '✕'}
            </span>
            <span>{toast.message}</span>
          </div>
        </div>
      )}
      
      {/* Modern Nav-style Header */}
<div className="nav-header-container" style={{position: 'fixed', top: 0, left: 0, right: 0, maxWidth: '100%', margin: '0', padding: '0', width: '100%', zIndex: 999, boxShadow: '0 8px 24px rgba(45, 80, 22, 0.12)'}}>
        <div className="nav-header" style={{background: '#fff', borderRadius: '2px', padding: '12px 20px', boxShadow: '0 8px 24px rgba(45, 80, 22, 0.12)', border: 'none', position: 'relative', overflow: 'visible'}}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', position: 'relative', zIndex: 1}}>
            {/* Left: logo + title */}
            <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
              <div className="logo" style={{flexShrink: 0, padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <img src="/images/alpha.png" alt="Alpha Logo" style={{height: '60px', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.08))'}} />
              </div>
              <div className="title" style={{display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                <div style={{display: 'flex', alignItems: 'baseline', gap: '8px'}}>
                  <h1 style={{fontSize: '22px', fontWeight: 900, color: '#1E6B47', margin: 0, letterSpacing: '-0.4px'}}>Underwriting System Menu</h1>
                </div>
                <p style={{fontSize: '12px', color: '#1E6B47', margin: 0, fontWeight: 500}}>Motor Car Insurance · Complete the form to proceed</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Progress Indicator - Enhanced Full Width */}
      <div style={{width: '95%', marginLeft: 'auto', marginRight: 'auto', paddingTop: '16px', paddingBottom: '16px', marginBottom: '26px', marginTop: '135px'}} role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={3} aria-label={`Step ${currentStep} of 3`}>
        <div style={{maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'center', alignItems: 'center', paddingX: '16px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '0', position: 'relative', width: '100%', maxWidth: '1000px'}}>
            {[{label: 'Info', step: 1}, {label: 'Rates', step: 2}, {label: 'Review', step: 3}].map((step, idx) => (
              <div key={idx} style={{display: 'flex', alignItems: 'center', flex: 1, position: 'relative'}}>
                {/* Enhanced Timeline Line */}
                {idx > 0 && (
                  <>
                    <div style={{
                      position: 'absolute',
                      left: '-50%',
                      top: '24px',
                      width: '100%',
                      height: '3px',
                      backgroundColor: step.step - 1 < currentStep ? '#FFDB58' : '#d1d5db',
                      transition: 'background-color 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                      zIndex: 0,
                      borderRadius: '2px'
                    }} />
                    <div style={{
                      position: 'absolute',
                      left: '-50%',
                      top: '24px',
                      width: step.step - 1 < currentStep ? '100%' : '0%',
                      height: '3px',
                      background: 'linear-gradient(90deg, #FFDB58 0%, #FFD93D 100%)',
                      transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                      zIndex: 1,
                      borderRadius: '2px',
                      boxShadow: step.step - 1 < currentStep ? '0 2px 8px rgba(255, 219, 88, 0.4)' : 'none'
                    }} />
                  </>
                )}
                
                {/* Enhanced Step Circle */}
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', position: 'relative', zIndex: 2, width: '100%'}}>
                  <button
                    onClick={() => handleStepClick(step.step)}
                    disabled={step.step >= currentStep}
                    aria-label={`Go to step ${step.step}: ${step.label}`}
                    aria-current={step.step === currentStep ? 'step' : undefined}
                    style={{
                      width: step.step === currentStep ? '60px' : '50px',
                      height: step.step === currentStep ? '60px' : '50px',
                      borderRadius: '50%',
                      backgroundColor: step.step <= currentStep ? '#FFDB58' : '#ffffff',
                      color: step.step <= currentStep ? '#2D5016' : '#d1d5db',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '800',
                      fontSize: step.step === currentStep ? '18px' : '15px',
                      cursor: step.step < currentStep ? 'pointer' : 'default',
                      transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      border: step.step === currentStep ? '4px solid #2D5016' : step.step < currentStep ? '3px solid #FFDB58' : '2px solid #e5e7eb',
                      boxShadow: step.step === currentStep 
                        ? '0 8px 24px rgba(255, 219, 88, 0.35), inset 0 2px 4px rgba(255, 255, 255, 0.4)' 
                        : step.step < currentStep 
                        ? '0 4px 12px rgba(255, 219, 88, 0.25)' 
                        : '0 2px 8px rgba(0, 0, 0, 0.08)',
                      position: 'relative',
                      overflow: 'hidden',
                      textShadow: step.step <= currentStep ? '0 1px 2px rgba(0, 0, 0, 0.1)' : 'none',
                      background: step.step === currentStep 
                        ? 'linear-gradient(135deg, #FFDB58 0%, #FFD93D 100%)' 
                        : step.step < currentStep 
                        ? 'linear-gradient(135deg, #FFDB58 0%, #FFC93D 100%)'
                        : 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
                    }}
                    onMouseEnter={(e) => {
                      if (step.step < currentStep) {
                        e.target.style.backgroundColor = '#FFC93D';
                        e.target.style.transform = 'scale(1.12) translateY(-3px)';
                        e.target.style.boxShadow = '0 12px 32px rgba(255, 219, 88, 0.45), 0 2px 8px rgba(45, 80, 22, 0.2)';
                      } else if (step.step === currentStep) {
                        e.target.style.transform = 'scale(1.08) translateY(-2px)';
                        e.target.style.boxShadow = '0 12px 32px rgba(255, 219, 88, 0.45), inset 0 2px 4px rgba(255, 255, 255, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1) translateY(0)';
                      e.target.style.boxShadow = step.step === currentStep 
                        ? '0 8px 24px rgba(255, 219, 88, 0.35), inset 0 2px 4px rgba(255, 255, 255, 0.4)' 
                        : step.step < currentStep 
                        ? '0 4px 12px rgba(255, 219, 88, 0.25)' 
                        : '0 2px 8px rgba(0, 0, 0, 0.08)';
                      if (step.step < currentStep) {
                        e.target.style.backgroundColor = '#FFDB58';
                      }
                    }}
                    onFocus={(e) => {
                      e.target.style.boxShadow = step.step === currentStep 
                        ? '0 0 0 4px rgba(255, 219, 88, 0.6), 0 8px 24px rgba(255, 219, 88, 0.35), inset 0 2px 4px rgba(255, 255, 255, 0.4)'
                        : '0 0 0 4px rgba(255, 219, 88, 0.4), 0 4px 12px rgba(255, 219, 88, 0.25)';
                    }}
                    onBlur={(e) => {
                      e.target.style.boxShadow = step.step === currentStep 
                        ? '0 8px 24px rgba(255, 219, 88, 0.35), inset 0 2px 4px rgba(255, 255, 255, 0.4)' 
                        : step.step < currentStep 
                        ? '0 4px 12px rgba(255, 219, 88, 0.25)' 
                        : '0 2px 8px rgba(0, 0, 0, 0.08)';
                    }}
                  >
                    {step.step < currentStep ? '✓' : step.step}
                  </button>
                  <span style={{
                    fontSize: step.step === currentStep ? '13px' : '12px',
                    fontWeight: step.step === currentStep ? '800' : step.step < currentStep ? '700' : '600',
                    color: step.step <= currentStep ? '#FFDB58' : '#9ca3af',
                    transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    whiteSpace: 'nowrap',
                    letterSpacing: step.step === currentStep ? '0.5px' : '0px',
                    textTransform: step.step === currentStep ? 'uppercase' : 'capitalize',
                  }}>
                    {step.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Form Container */}
      <div style={{maxWidth: '1400px', margin: '0 auto', paddingBottom: '20px', paddingLeft: '10px', paddingRight: '10px'}}>
        <div style={{display: 'grid', gridTemplateColumns: currentStep === 2 || currentStep === 3 ? '1fr' : 'minmax(280px, 1fr) 2fr', gap: '20px'}}>
          {/* Left Sidebar - Hidden on Rates and Review Steps */}
          {currentStep !== 2 && currentStep !== 3 && (
          <div style={stepTransitionStyle}>
            <div style={{
              background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)', 
              borderRadius: '12px', 
              padding: '20px', 
              boxShadow: '0 2px 8px rgba(45, 80, 22, 0.08)', 
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
              border: '1px solid rgba(90, 140, 58, 0.2)'
            }} onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(45, 80, 22, 0.12)';
              e.currentTarget.style.borderColor = 'rgba(90, 140, 58, 0.3)';
            }} onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(45, 80, 22, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(90, 140, 58, 0.2)';
            }}>
              <div style={{
                marginBottom: '10px', 
                padding: '15px', 
                background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
                borderRadius: '10px', 
                border: '1px solid rgba(90, 140, 58, 0.2)'
              }}>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px'}}>
                  <div style={{width: '5px', height: '28px', backgroundColor: '#2D5016', borderRadius: '3px'}}></div>
                  <h3 style={{fontSize: '14px', fontWeight: '800', color: '#2D5016', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px'}}>Quick Reference</h3>
                </div>
                
                {/* Completion Tracking */}
                <div style={{marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end'}} aria-live="polite" aria-label={`Quick Reference completion status: ${completionPercentage === 100 ? 'Complete' : 'Incomplete'}`}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <div style={{width: '24px', height: '24px', borderRadius: '50%', backgroundColor: completionPercentage === 100 ? '#1a5f3f' : '#e5e7eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700'}} aria-hidden="true">
                      {completionPercentage === 100 ? '✓' : '○'}
                    </div>
                    <span style={{fontSize: '12px', color: completionPercentage === 100 ? '#1a5f3f' : '#d1d5db', fontWeight: '600'}}>
                      {completionPercentage === 100 ? 'Complete' : 'Incomplete'}
                    </span>
                  </div>
                </div>
                
                <div style={{marginBottom: '16px'}}>
                  <label htmlFor="assured-input" style={{fontSize: '11px', fontWeight: '800', color: '#1a1a1a', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.3px'}}>Assured</label>
                  <input 
                    id="assured-input"
                    type="text" 
                    name="assured"
                    value={formData.assured}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter assured name"
                    aria-label="Assured name - required"
                    aria-required="true"
                    onFocus={(e) => {
                      e.target.style.boxShadow = '0 0 0 3px rgba(26, 95, 63, 0.12)';
                      e.target.style.backgroundColor = '#f8fdf9';
                    }}
                    style={{...inputBaseStyle, textTransform: 'uppercase'}}
                  />
                </div>

                <div style={{marginBottom: '16px'}}>
                  <label htmlFor="address-input" style={{fontSize: '11px', fontWeight: '800', color: '#1a1a1a', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.3px'}}>Address</label>
                  <input 
                    id="address-input"
                    type="text" 
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter address"
                    aria-label="Address - required"
                    aria-required="true"
                    onFocus={(e) => {
                      e.target.style.boxShadow = '0 0 0 3px rgba(26, 95, 63, 0.12)';
                      e.target.style.backgroundColor = '#f8fdf9';
                    }}
                    style={{...inputBaseStyle, textTransform: 'uppercase'}}
                  />
                </div>

                <div style={{display: 'flex', gap: '12px'}}>
                  <div style={{flex: 1}}>
                    <label htmlFor="coc-number-input" style={{fontSize: '11px', fontWeight: '800', color: '#1a1a1a', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.3px'}}>COC Number</label>
                    <input 
                      id="coc-number-input"
                      type="text" 
                      name="cocNumber"
                      value={formData.cocNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        setFormData(prev => ({ ...prev, cocNumber: value }));
                      }}
                      onBlur={handleBlur}
                      placeholder="Enter COC no."
                      aria-label="COC Number - numbers only - required"
                      aria-required="true"
                      inputMode="numeric"
                      onFocus={(e) => {
                        e.target.style.boxShadow = '0 0 0 3px rgba(26, 95, 63, 0.12)';
                        e.target.style.backgroundColor = '#f8fdf9';
                      }}
                      style={inputBaseStyle}
                    />
                  </div>

                  <div style={{flex: 1}}>
                    <label htmlFor="or-number-input" style={{fontSize: '11px', fontWeight: '800', color: '#1a1a1a', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.3px'}}>OR Number</label>
                    <input 
                      id="or-number-input"
                      type="text" 
                      name="orNumber"
                      value={formData.orNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        setFormData(prev => ({ ...prev, orNumber: value }));
                      }}
                      onBlur={handleBlur}
                      placeholder="Enter OR no."
                      aria-label="OR Number - numbers only"
                      inputMode="numeric"
                      onFocus={(e) => {
                        e.target.style.boxShadow = '0 0 0 3px rgba(26, 95, 63, 0.12)';
                        e.target.style.backgroundColor = '#f8fdf9';
                      }}
                      style={inputBaseStyle}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Right Main Content */}
          <div>
            {/* STEP 1: Info */}
            {currentStep === 1 && (
              <div style={{
                ...stepTransitionStyle, 
                background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)', 
                borderRadius: '12px', 
                padding: '28px', 
                marginBottom: '20px', 
                boxShadow: '0 3px 12px rgba(45, 80, 22, 0.08)', 
                maxWidth: '1000px', 
                margin: '0 auto 20px', 
                transition: 'all 0.3s ease', 
                border: '2px solid rgba(90, 140, 58, 0.15)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(45, 80, 22, 0.12)';
                e.currentTarget.style.borderColor = 'rgba(90, 140, 58, 0.3)';
              }} 
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(45, 80, 22, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(90, 140, 58, 0.15)';
              }}>
                
                {/* Section 1: Policy Information */}
                <div style={{
                  marginBottom: '10px', 
                  padding: '15px', 
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
                  borderRadius: '10px', 
                  border: '1px solid rgba(90, 140, 58, 0.2)'
                }}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px'}}>
                    <div style={{width: '4px', height: '22px', backgroundColor: '#5A8C3A', borderRadius: '2px'}}></div>
                    <h4 style={{
                      fontSize: '13px', 
                      fontWeight: '700', 
                      color: '#2D5016', 
                      margin: 0, 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.3px'
                    }}>
                      Policy Information
                    </h4>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px'}} aria-live="polite" aria-label={`Policy Information: ${isPolicyInfoComplete() ? 'Complete' : 'Incomplete'}`}>
                    <div style={{width: '24px', height: '24px', borderRadius: '50%', backgroundColor: isPolicyInfoComplete() ? '#1a5f3f' : '#e5e7eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700'}} aria-hidden="true">
                      {isPolicyInfoComplete() ? '✓' : '○'}
                    </div>
                    <span style={{fontSize: '12px', color: isPolicyInfoComplete() ? '#1a5f3f' : '#d1d5db', fontWeight: '600'}}>
                      {isPolicyInfoComplete() ? 'Complete' : 'Incomplete'}
                    </span>
                  </div>
                  
                  <div style={{display: 'grid', gridTemplateColumns: '150px 1fr 100px 150px 150px', gap: '16px', alignItems: 'flex-end'}}>
                    <div>
                      <label htmlFor="type-select" style={{fontSize: '12px', fontWeight: '800', color: '#1a1a1a', display: 'block', marginBottom: '8px'}}>Type</label>
                      <select id="type-select" name="cType" value={formData.cType} onChange={handleChange} onBlur={handleBlur} aria-label="Policy type" onFocus={(e) => {
                        e.target.style.boxShadow = '0 0 0 3px rgba(26, 95, 63, 0.12)';
                        e.target.style.backgroundColor = '#f8fdf9';
                      }} style={inputBaseStyle}>
                        <option>Select Type</option>
                        <option>MC-CTPL-CEB</option>
                        <option>PC-CTPL-CEB</option>
                        <option>CV-CTPL-CEB</option>
                        <option>LTO-CTPL-CEB</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="policy-number-input" style={{fontSize: '12px', fontWeight: '800', color: '#1a1a1a', display: 'block', marginBottom: '8px'}}>Policy Number</label>
                      <input 
                        id="policy-number-input"
                        type="text" 
                        name="policyNumber"
                        value={formData.policyNumber}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          setFormData(prev => ({ ...prev, policyNumber: value }));
                        }}
                        onBlur={handleBlur}
                        placeholder="Policy number"
                        aria-label="Policy Number - numbers only - required"
                        aria-required="true"
                        inputMode="numeric"
                        onFocus={(e) => {
                          e.target.style.boxShadow = '0 0 0 3px rgba(26, 95, 63, 0.12)';
                          e.target.style.backgroundColor = '#f8fdf9';
                        }}
                        style={inputBaseStyle}
                      />
                    </div>
                    <div>
                      <label htmlFor="year-select" style={{fontSize: '12px', fontWeight: '800', color: '#1a1a1a', display: 'block', marginBottom: '8px'}}>Year</label>
                      <div style={{position: 'relative', display: 'inline-block', width: '100%'}}>
                        <input 
                          id="year-select"
                          type="text"
                          readOnly
                          value={formData.year || 'Select'}
                          placeholder="Select"
                          onClick={(e) => {
                            const picker = e.currentTarget.nextElementSibling;
                            if (picker) picker.style.display = picker.style.display === 'none' ? 'block' : 'none';
                          }}
                          style={{...inputBaseStyle, cursor: 'pointer'}}
                          aria-label="Policy year"
                        />
                        <div style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          display: 'none',
                          backgroundColor: 'white',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          zIndex: 1000,
                          padding: '16px',
                          marginTop: '4px',
                          minWidth: '280px',
                          maxHeight: '400px',
                          overflowY: 'auto'
                        }}
                        onClick={(e) => e.stopPropagation()}>
                          <div style={{textAlign: 'center', marginBottom: '12px', fontWeight: '700', color: '#1a1a1a'}}>
                            Select Year
                          </div>
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 1fr)',
                            gap: '8px'
                          }}>
                            {Array.from({ length: 125 }, (_, i) => 2050 - i).map((year) => (
                              <button
                                key={year}
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setFormData(prev => ({ ...prev, year: year.toString() }));
                                  const picker = e.currentTarget.closest('[style*="position: absolute"]');
                                  if (picker) picker.style.display = 'none';
                                }}
                                style={{
                                  padding: '10px 8px',
                                  border: formData.year === year.toString() ? '2px solid #5A8C3A' : '1px solid #e5e7eb',
                                  borderRadius: '6px',
                                  backgroundColor: formData.year === year.toString() ? '#e8f5e9' : 'white',
                                  color: formData.year === year.toString() ? '#2D5016' : '#6b7280',
                                  fontWeight: formData.year === year.toString() ? '700' : '500',
                                  cursor: 'pointer',
                                  fontSize: '13px',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                  if (formData.year !== year.toString()) {
                                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                                    e.currentTarget.style.borderColor = '#5A8C3A';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (formData.year !== year.toString()) {
                                    e.currentTarget.style.backgroundColor = 'white';
                                    e.currentTarget.style.borderColor = '#e5e7eb';
                                  }
                                }}>
                                {year}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="date-issued-input" style={{fontSize: '12px', fontWeight: '800', color: '#1a1a1a', display: 'block', marginBottom: '8px'}}>Issued</label>
                      <input 
                        id="date-issued-input"
                        type="date" 
                        name="dateIssued" 
                        value={formData.dateIssued} 
                        onChange={handleChange}
                        onBlur={handleBlur}
                        aria-label="Date issued - required"
                        aria-required="true"
                        onClick={(e) => {
                          if (e.target.showPicker) {
                            e.target.showPicker();
                          }
                        }}
                        onFocus={(e) => {
                          e.target.style.boxShadow = '0 0 0 3px rgba(26, 95, 63, 0.12)';
                          e.target.style.backgroundColor = '#f8fdf9';
                        }}
                        style={{...inputBaseStyle, cursor: 'pointer'}}
                      />
                    </div>
                    <div>
                      <label htmlFor="date-received-input" style={{fontSize: '12px', fontWeight: '800', color: '#1a1a1a', display: 'block', marginBottom: '8px'}}>Received</label>
                      <input 
                        id="date-received-input"
                        type="date" 
                        name="dateReceived"
                        value={formData.dateReceived} 
                        onChange={handleChange}
                        onBlur={handleBlur}
                        aria-label="Date received - required"
                        aria-required="true"
                        onClick={(e) => {
                          if (e.target.showPicker) {
                            e.target.showPicker();
                          }
                        }}
                        onFocus={(e) => {
                          e.target.style.boxShadow = '0 0 0 3px rgba(26, 95, 63, 0.12)';
                          e.target.style.backgroundColor = '#f8fdf9';
                        }}
                        style={{...inputBaseStyle, cursor: 'pointer'}}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Insurance Period */}
                <div style={{
                  marginBottom: '10px', 
                  padding: '15px', 
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
                  borderRadius: '10px', 
                  border: '1px solid rgba(90, 140, 58, 0.2)'
                }}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px'}}>
                    <div style={{width: '4px', height: '22px', backgroundColor: '#5A8C3A', borderRadius: '2px'}}></div>
                    <h4 style={{
                      fontSize: '13px', 
                      fontWeight: '700', 
                      color: '#2D5016', 
                      margin: 0, 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.3px'
                    }}>
                      Insurance Period
                    </h4>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px'}} aria-live="polite" aria-label={`Insurance Period: ${isInsurancePeriodComplete() ? 'Complete' : 'Incomplete'}`}>
                    <div style={{width: '24px', height: '24px', borderRadius: '50%', backgroundColor: isInsurancePeriodComplete() ? '#1a5f3f' : '#e5e7eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700'}} aria-hidden="true">
                      {isInsurancePeriodComplete() ? '✓' : '○'}
                    </div>
                    <span style={{fontSize: '12px', color: isInsurancePeriodComplete() ? '#1a5f3f' : '#d1d5db', fontWeight: '600'}}>
                      {isInsurancePeriodComplete() ? 'Complete' : 'Incomplete'}
                    </span>
                  </div>
                  
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                    <div>
                      <label htmlFor="from-date-input" style={{fontSize: '12px', fontWeight: '800', color: '#1a1a1a', display: 'block', marginBottom: '8px'}}>From Date</label>
                      <input 
                        id="from-date-input"
                        type="date" 
                        name="insuranceFromDate" 
                        value={formData.insuranceFromDate} 
                        onChange={handleChange}
                        onBlur={handleBlur}
                        aria-label="Insurance from date - required"
                        aria-required="true"
                        onClick={(e) => {
                          if (e.target.showPicker) {
                            e.target.showPicker();
                          }
                        }}
                        onFocus={(e) => {
                          e.target.style.boxShadow = '0 0 0 3px rgba(26, 95, 63, 0.12)';
                          e.target.style.backgroundColor = '#f8fdf9';
                        }}
                        style={{...inputBaseStyle, cursor: 'pointer'}}
                      />
                    </div>
                    <div>
                      <label htmlFor="to-date-input" style={{fontSize: '12px', fontWeight: '800', color: '#1a1a1a', display: 'block', marginBottom: '8px'}}>To Date <span style={{color: '#ef4444'}}></span></label>
                      <input 
                        id="to-date-input"
                        type="date" 
                        name="insuranceToDate" 
                        value={formData.insuranceToDate} 
                        onChange={handleChange}
                        onBlur={handleBlur}
                        aria-label="Insurance to date - required"
                        aria-required="true"
                        onClick={(e) => {
                          if (e.target.showPicker) {
                            e.target.showPicker();
                          }
                        }}
                        onFocus={(e) => {
                          e.target.style.boxShadow = '0 0 0 3px rgba(26, 95, 63, 0.12)';
                          e.target.style.backgroundColor = '#f8fdf9';
                        }}
                        style={{...inputBaseStyle, cursor: 'pointer'}}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Vehicle Details */}
                <div style={{
                  marginBottom: '10px', 
                  padding: '15px', 
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
                  borderRadius: '10px', 
                  border: '1px solid rgba(90, 140, 58, 0.2)'
                }}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px'}}>
                    <div style={{width: '4px', height: '22px', backgroundColor: '#5A8C3A', borderRadius: '2px'}}></div>
                    <h4 style={{
                      fontSize: '13px', 
                      fontWeight: '700', 
                      color: '#2D5016', 
                      margin: 0, 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.3px'
                    }}>
                      Vehicle Details
                    </h4>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px'}} aria-live="polite" aria-label={`Vehicle Details: ${isVehicleDetailsComplete() ? 'Complete' : 'Incomplete'}`}>
                    <div style={{width: '24px', height: '24px', borderRadius: '50%', backgroundColor: isVehicleDetailsComplete() ? '#1a5f3f' : '#e5e7eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700'}} aria-hidden="true">
                      {isVehicleDetailsComplete() ? '✓' : '○'}
                    </div>
                    <span style={{fontSize: '12px', color: isVehicleDetailsComplete() ? '#1a5f3f' : '#d1d5db', fontWeight: '600'}}>
                      {isVehicleDetailsComplete() ? 'Complete' : 'Incomplete'}
                    </span>
                  </div>
                  
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px'}}>
                    <div>
                      <label htmlFor="model-input" style={{fontSize: '12px', fontWeight: '800', color: '#1a1a1a', display: 'block', marginBottom: '8px'}}>Model</label>
                      <input 
                        id="model-input"
                        type="text" 
                        name="model" 
                        value={formData.model} 
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Enter model"
                        aria-label="Vehicle model - required"
                        aria-required="true"
                        onFocus={(e) => {
                          e.target.style.boxShadow = '0 0 0 3px rgba(26, 95, 63, 0.12)';
                          e.target.style.backgroundColor = '#f8fdf9';
                        }}
                        style={{...inputBaseStyle, textTransform: 'uppercase'}} 
                      />
                    </div>
                    <div>
                      <label htmlFor="make-input" style={{fontSize: '12px', fontWeight: '800', color: '#1a1a1a', display: 'block', marginBottom: '8px'}}>Make</label>
                      <input 
                        id="make-input"
                        type="text" 
                        name="make" 
                        value={formData.make} 
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Enter make"
                        aria-label="Vehicle make - required"
                        aria-required="true"
                        onFocus={(e) => {
                          e.target.style.boxShadow = '0 0 0 3px rgba(26, 95, 63, 0.12)';
                          e.target.style.backgroundColor = '#f8fdf9';
                        }}
                        style={{...inputBaseStyle, textTransform: 'uppercase'}}
                      />
                    </div>
                    <div>
                      <label htmlFor="body-type-input" style={{fontSize: '12px', fontWeight: '800', color: '#1a1a1a', display: 'block', marginBottom: '8px'}}>Body Type</label>
                      <input 
                        id="body-type-input"
                        type="text" 
                        name="bodyType" 
                        value={formData.bodyType} 
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Enter type"
                        aria-label="Vehicle body type - required"
                        aria-required="true"
                        onFocus={(e) => {
                          e.target.style.boxShadow = '0 0 0 3px rgba(26, 95, 63, 0.12)';
                          e.target.style.backgroundColor = '#f8fdf9';
                        }}
                        style={{...inputBaseStyle, textTransform: 'uppercase'}}
                      />
                    </div>
                  </div>

                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px', marginBottom: '16px'}}>
                    <div>
                      <label htmlFor="color-input" style={{fontSize: '12px', fontWeight: '800', color: '#1a1a1a', display: 'block', marginBottom: '8px'}}>Color</label>
                      <input 
                        id="color-input"
                        type="text" 
                        name="color" 
                        value={formData.color} 
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Color"
                        aria-label="Vehicle color - required"
                        aria-required="true"
                        onFocus={(e) => {
                          e.target.style.boxShadow = '0 0 0 3px rgba(26, 95, 63, 0.12)';
                          e.target.style.backgroundColor = '#f8fdf9';
                        }}
                        style={{...inputBaseStyle, textTransform: 'uppercase'}}
                      />
                    </div>
                    <div>
                      <label htmlFor="mv-file-input" style={{fontSize: '12px', fontWeight: '800', color: '#1a1a1a', display: 'block', marginBottom: '8px'}}>MV File No.</label>
                      <input 
                        id="mv-file-input"
                        type="text" 
                        name="mvFileNo" 
                        value={formData.mvFileNo} 
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="File no."
                        aria-label="Motor vehicle file number - required"
                        aria-required="true"
                        onFocus={(e) => {
                          e.target.style.boxShadow = '0 0 0 3px rgba(26, 95, 63, 0.12)';
                          e.target.style.backgroundColor = '#f8fdf9';
                        }}
                        style={{...inputBaseStyle, textTransform: 'uppercase'}}
                      />
                    </div>
                    <div>
                      <label htmlFor="plate-input" style={{fontSize: '12px', fontWeight: '800', color: '#1a1a1a', display: 'block', marginBottom: '8px'}}>Plate No.</label>
                      <input 
                        id="plate-input"
                        type="text" 
                        name="plateNo" 
                        value={formData.plateNo} 
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Plate"
                        aria-label="License plate number - required"
                        aria-required="true"
                        onFocus={(e) => {
                          e.target.style.boxShadow = '0 0 0 3px rgba(26, 95, 63, 0.12)';
                          e.target.style.backgroundColor = '#f8fdf9';
                        }}
                        style={{...inputBaseStyle, textTransform: 'uppercase'}}
                      />
                    </div>
                    <div>
                      <label htmlFor="chassis-input" style={{fontSize: '12px', fontWeight: '800', color: '#1a1a1a', display: 'block', marginBottom: '8px'}}>Chassis No.</label>
                      <input 
                        id="chassis-input"
                        type="text" 
                        name="serialChassisNo" 
                        value={formData.serialChassisNo} 
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Chassis"
                        aria-label="Chassis number - required"
                        aria-required="true"
                        onFocus={(e) => {
                          e.target.style.boxShadow = '0 0 0 3px rgba(26, 95, 63, 0.12)';
                          e.target.style.backgroundColor = '#f8fdf9';
                        }}
                        style={{...inputBaseStyle, textTransform: 'uppercase'}}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="motor-input" style={{fontSize: '12px', fontWeight: '800', color: '#1a1a1a', display: 'block', marginBottom: '8px'}}>Motor No.</label>
                    <input 
                      id="motor-input"
                      type="text" 
                      name="motorNo" 
                      value={formData.motorNo} 
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Enter motor number"
                      aria-label="Motor number - required"
                      aria-required="true"
                      onFocus={(e) => {
                        e.target.style.boxShadow = '0 0 0 3px rgba(26, 95, 63, 0.12)';
                        e.target.style.backgroundColor = '#f8fdf9';
                      }}
                      style={{...inputBaseStyle, textTransform: 'uppercase'}} 
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Rates */}
            {currentStep === 2 && (
              <div style={{
                ...stepTransitionStyle, 
                background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)', 
                borderRadius: '12px', 
                padding: '28px', 
                marginBottom: '20px', 
                boxShadow: '0 3px 12px rgba(45, 80, 22, 0.08)', 
                maxWidth: '1000px', 
                margin: '0 auto 20px', 
                transition: 'all 0.3s ease', 
                border: '2px solid rgba(90, 140, 58, 0.15)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(45, 80, 22, 0.12)';
                e.currentTarget.style.borderColor = 'rgba(90, 140, 58, 0.3)';
              }} 
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(45, 80, 22, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(90, 140, 58, 0.15)';
              }}>
                
                {/* Header Section with Icon */}
                <div style={{textAlign: 'center', marginBottom: '32px', position: 'relative'}}>
                  <div style={{
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    width: '56px', 
                    height: '56px', 
                    borderRadius: '50%', 
                    backgroundColor: '#dcfce7', 
                    marginBottom: '11px', 
                    boxShadow: '0 4px 12px rgba(45, 80, 22, 0.15)'
                  }}>
                    <span style={{fontSize: '28px', color: '#2D5016'}}>₱</span>
                  </div>
                  <h3 style={{
                    fontSize: '26px', 
                    fontWeight: '800', 
                    color: '#1a5f3f', 
                    margin: '0 0 5px 0', 
                    letterSpacing: '-0.5px'
                  }}>
                    Insurance Rates Calculation
                  </h3>
                  <p style={{fontSize: '14px', color: '#5A8C3A', margin: 0, fontWeight: '500'}}>
                    Enter the premium amount. Other charges will be calculated automatically
                  </p>
                </div>
                
                {/* Input Fields Section - Featured Section */}
                <div style={{
                  marginBottom: '10px', 
                  padding: '15px', 
                  background: 'linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%)', 
                  borderRadius: '12px', 
                  border: '2px solid #a7d49b', 
                  boxShadow: '0 2px 8px rgba(45, 80, 22, 0.08)'
                }}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px'}}>
                    <div style={{width: '5px', height: '28px', backgroundColor: '#2D5016', borderRadius: '3px'}}></div>
                    <h4 style={{
                      fontSize: '14px', 
                      fontWeight: '800', 
                      color: '#2D5016', 
                      margin: 0, 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.5px'
                    }}>
                      Premium & Charges
                    </h4>
                  </div>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                    <div style={{
                      padding: '16px', 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                      borderRadius: '10px', 
                      border: '2px solid #5A8C3A', 
                      boxShadow: '0 2px 6px rgba(45, 80, 22, 0.06)', 
                      transition: 'all 0.2s'
                    }} 
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(45, 80, 22, 0.12)';
                    }} 
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 6px rgba(45, 80, 22, 0.06)';
                    }}>
                      <label htmlFor="premium-input" style={{fontSize: '10px', fontWeight: '700', color: '#5A8C3A', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Premium (Input)</label>
                      <input 
                        id="premium-input"
                        type="text" 
                        value={ratesData.premium}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9.]/g, '');
                          setRatesData({...ratesData, premium: value});
                        }}
                        placeholder="0.00"
                        aria-label="Premium amount - numbers only"
                        inputMode="decimal"
                        onFocus={(e) => {
                          e.target.style.borderColor = '#1a5f3f';
                          e.target.style.boxShadow = '0 0 0 3px rgba(26, 95, 63, 0.12)';
                          e.target.style.backgroundColor = '#f8fdf9';
                        }}
                        onBlur={(e) => {
                          e.target.style.boxShadow = '';
                          e.target.style.borderColor = '#d1d5db';
                          e.target.style.backgroundColor = '#ffffff';
                        }}
                        style={{...inputBaseStyle, fontWeight: '600', borderColor: '#1a5f3f', width: '100%'}}
                      />
                    </div>
                    <div style={{
                      padding: '16px', 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                      borderRadius: '10px', 
                      border: '2px solid #5A8C3A', 
                      boxShadow: '0 2px 6px rgba(45, 80, 22, 0.06)', 
                      transition: 'all 0.2s'
                    }} 
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(45, 80, 22, 0.12)';
                    }} 
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 6px rgba(45, 80, 22, 0.06)';
                    }}>
                      <label htmlFor="other-charges-input" style={{fontSize: '10px', fontWeight: '700', color: '#5A8C3A', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Other Charges (Input)</label>
                      <input 
                        id="other-charges-input"
                        type="text" 
                        value={ratesData.otherCharges}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9.]/g, '');
                          setRatesData({...ratesData, otherCharges: value});
                        }}
                        placeholder="0.00"
                        aria-label="Other charges - numbers only"
                        inputMode="decimal"
                        onFocus={(e) => {
                          e.target.style.borderColor = '#1a5f3f';
                          e.target.style.boxShadow = '0 0 0 3px rgba(26, 95, 63, 0.12)';
                          e.target.style.backgroundColor = '#f8fdf9';
                        }}
                        onBlur={(e) => {
                          e.target.style.boxShadow = '';
                          e.target.style.borderColor = '#d1d5db';
                          e.target.style.backgroundColor = '#ffffff';
                        }}
                        style={{...inputBaseStyle, fontWeight: '600', borderColor: '#1a5f3f', width: '100%'}}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Calculated Charges Section */}
                <div style={{
                  marginBottom: '10px', 
                  padding: '15px', 
                  backgroundColor: 'rgba(255, 255, 255, 0.6)', 
                  borderRadius: '10px', 
                  border: '1px solid rgba(90, 140, 58, 0.2)'
                }}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px'}}>
                    <div style={{width: '4px', height: '22px', backgroundColor: '#5A8C3A', borderRadius: '2px'}}></div>
                    <h4 style={{
                      fontSize: '13px', 
                      fontWeight: '700', 
                      color: '#2D5016', 
                      margin: 0, 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.3px'
                    }}>
                      Calculated Charges
                    </h4>
                  </div>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px'}}>
                    <div style={{
                      padding: '12px', 
                      backgroundColor: 'rgba(248, 250, 252, 0.8)', 
                      borderRadius: '8px', 
                      border: '3px solid #a7d49b'
                    }}>
                      <label htmlFor="doc-stamps-output" style={{fontSize: '10px', color: '#5A8C3A', textTransform: 'uppercase', fontWeight: '600', margin: '0 0 4px 0', display: 'block'}}>Doc. Stamps (12.5%)</label>
                      <input 
                        id="doc-stamps-output"
                        type="number" 
                        value={rates.docStamps.toFixed(2)}
                        readOnly
                        placeholder="0.00"
                        aria-label="Doc stamps amount calculated"
                        style={{...inputBaseStyle, backgroundColor: '#f8fafc', borderColor: '#d1d5db', fontWeight: '600', color: '#1a3a0f', width: '100%'}}
                      />
                    </div>
                    <div style={{
                      padding: '12px', 
                      backgroundColor: 'rgba(248, 250, 252, 0.8)', 
                      borderRadius: '8px', 
                      border: '3px solid #a7d49b'
                    }}>
                      <label htmlFor="evat-output" style={{fontSize: '10px', color: '#5A8C3A', textTransform: 'uppercase', fontWeight: '600', margin: '0 0 4px 0', display: 'block'}}>E-VAT (12%)</label>
                      <input 
                        id="evat-output"
                        type="number" 
                        value={rates.eVat.toFixed(2)}
                        readOnly
                        placeholder="0.00"
                        aria-label="E-VAT amount calculated"
                        style={{...inputBaseStyle, backgroundColor: '#f8fafc', borderColor: '#d1d5db', fontWeight: '600', color: '#1a3a0f', width: '100%'}}
                      />
                    </div>
                    <div style={{
                      padding: '12px', 
                      backgroundColor: 'rgba(248, 250, 252, 0.8)', 
                      borderRadius: '8px', 
                      border: '3px solid #a7d49b'
                    }}>
                      <label htmlFor="lgt-output" style={{fontSize: '10px', color: '#5A8C3A', textTransform: 'uppercase', fontWeight: '600', margin: '0 0 4px 0', display: 'block'}}>Local Govt Tax (0.5%)</label>
                      <input 
                        id="lgt-output"
                        type="number" 
                        value={rates.lgt.toFixed(2)}
                        readOnly
                        placeholder="0.00"
                        aria-label="Local government tax amount calculated"
                        style={{...inputBaseStyle, backgroundColor: '#f8fafc', borderColor: '#d1d5db', fontWeight: '600', color: '#1a3a0f', width: '100%'}}
                      />
                    </div>
                    <div style={{
                      padding: '12px', 
                      backgroundColor: 'rgba(248, 250, 252, 0.8)', 
                      borderRadius: '8px', 
                      border: '3px solid #a7d49b'
                    }}>
                      <label htmlFor="auth-fee-output" style={{fontSize: '10px', color: '#5A8C3A', textTransform: 'uppercase', fontWeight: '600', margin: '0 0 4px 0', display: 'block'}}>Auth. Fee (Fixed)</label>
                      <input 
                        id="auth-fee-output"
                        type="number" 
                        value={rates.authFee.toFixed(2)}
                        readOnly
                        placeholder="0.00"
                        aria-label="Authorization fee fixed amount"
                        style={{...inputBaseStyle, backgroundColor: '#f8fafc', borderColor: '#d1d5db', fontWeight: '600', color: '#1a3a0f', width: '100%'}}
                      />
                    </div>
                  </div>
                </div>

                {/* Total Premium Summary */}
                <div style={{
                  padding: '20px', 
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',  
                  borderRadius: '12px', 
                  border: '2px solid #5A8C3A',
                  boxShadow: '0 4px 12px rgba(45, 80, 22, 0.12)',
                  textAlign: 'center'
                }} role="region" aria-label="Total premium amount summary">
                  <p style={{fontSize: '15px', color: '#ffffff', margin: '0 0 8px 0', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px'}}>Grand Total</p>
                  <p style={{fontSize: '32px', fontWeight: '800', color: '#ffffff', margin: 0}} aria-live="polite">₱{rates.total.toFixed(2)}</p>
                </div>
              </div>
            )}

            {/* STEP 3: Review */}
{currentStep === 3 && (
<div style={{
    ...stepTransitionStyle, 
    background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)', 
    borderRadius: '12px', 
    padding: '28px', 
    marginBottom: '20px', 
    boxShadow: '0 3px 12px rgba(45, 80, 22, 0.08)', 
    maxWidth: '1000px', 
    margin: '0 auto 20px', 
    transition: 'all 0.3s ease', 
    border: '2px solid rgba(90, 140, 58, 0.15)'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.boxShadow = '0 8px 24px rgba(45, 80, 22, 0.12)';
    e.currentTarget.style.borderColor = 'rgba(90, 140, 58, 0.3)';
  }} 
  onMouseLeave={(e) => {
    e.currentTarget.style.boxShadow = '0 4px 16px rgba(45, 80, 22, 0.08)';
    e.currentTarget.style.borderColor = 'rgba(90, 140, 58, 0.15)';
  }}>
    
    {/* Header Section with Icon */}
    <div style={{textAlign: 'center', marginBottom: '32px', position: 'relative'}}>
      <div style={{
        display: 'inline-flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        width: '56px', 
        height: '56px', 
        borderRadius: '50%', 
        backgroundColor: '#dcfce7', 
        marginBottom: '11px', 
        boxShadow: '0 4px 12px rgba(45, 80, 22, 0.15)'
      }}>
        <span style={{fontSize: '28px', color: '#2D5016'}}>✓</span>
      </div>
      <h3 style={{
        fontSize: '26px', 
        fontWeight: '800', 
        color: '#1a5f3f', 
        margin: '0 0 5px 0', 
        letterSpacing: '-0.5px'
      }}>
        Review Your Information
      </h3>
      <p style={{fontSize: '14px', color: '#5A8C3A', margin: 0, fontWeight: '500'}}>
        Please verify all details before submission
      </p>
    </div>
    
    {/* Quick Reference Summary - Featured Section */}
    <div style={{
      marginBottom: '10px', 
      padding: '15px', 
      background: 'linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%)', 
      borderRadius: '12px', 
      border: '2px solid #a7d49b', 
      boxShadow: '0 2px 8px rgba(45, 80, 22, 0.08)'
    }}>
      <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px'}}>
        <div style={{width: '5px', height: '28px', backgroundColor: '#2D5016', borderRadius: '3px'}}></div>
        <h4 style={{
          fontSize: '14px', 
          fontWeight: '800', 
          color: '#2D5016', 
          margin: 0, 
          textTransform: 'uppercase', 
          letterSpacing: '0.5px'
        }}>
          Quick Reference
        </h4>
      </div>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px'}}>
        <div style={{
          padding: '16px', 
          backgroundColor: 'rgba(255, 255, 255, 0.9)', 
          borderRadius: '10px', 
          border: '2px solid #5A8C3A', 
          boxShadow: '0 2px 6px rgba(45, 80, 22, 0.06)', 
          transition: 'all 0.2s'
        }} 
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(45, 80, 22, 0.12)';
        }} 
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 6px rgba(45, 80, 22, 0.06)';
        }}>
          <p style={{
            fontSize: '10px', 
            color: '#5A8C3A', 
            textTransform: 'uppercase', 
            fontWeight: '700', 
            margin: '0 0 6px 0', 
            letterSpacing: '0.5px'
          }}>
            Assured
          </p>
          <p style={{fontSize: '15px', fontWeight: '700', color: '#1a3a0f', margin: 0}}>
            {formData.assured || '-'}
          </p>
        </div>
        <div style={{
          padding: '16px', 
          backgroundColor: 'rgba(255, 255, 255, 0.9)', 
          borderRadius: '10px', 
          border: '2px solid #5A8C3A', 
          boxShadow: '0 2px 6px rgba(45, 80, 22, 0.06)', 
          transition: 'all 0.2s'
        }} 
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(45, 80, 22, 0.12)';
        }} 
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 6px rgba(45, 80, 22, 0.06)';
        }}>
          <p style={{
            fontSize: '10px', 
            color: '#5A8C3A', 
            textTransform: 'uppercase', 
            fontWeight: '700', 
            margin: '0 0 6px 0', 
            letterSpacing: '0.5px'
          }}>
            Address
          </p>
          <p style={{fontSize: '15px', fontWeight: '700', color: '#1a3a0f', margin: 0}}>
            {formData.address || '-'}
          </p>
        </div>
        <div style={{
          padding: '16px', 
          backgroundColor: 'rgba(255, 255, 255, 0.9)', 
          borderRadius: '10px', 
          border: '2px solid #5A8C3A', 
          boxShadow: '0 2px 6px rgba(45, 80, 22, 0.06)', 
          transition: 'all 0.2s'
        }} 
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(45, 80, 22, 0.12)';
        }} 
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 6px rgba(45, 80, 22, 0.06)';
        }}>
          <p style={{
            fontSize: '10px', 
            color: '#5A8C3A', 
            textTransform: 'uppercase', 
            fontWeight: '700', 
            margin: '0 0 6px 0', 
            letterSpacing: '0.5px'
          }}>
            COC #
          </p>
          <p style={{fontSize: '15px', fontWeight: '700', color: '#1a3a0f', margin: 0}}>
            {formData.cocNumber || '-'}
          </p>
        </div>
        <div style={{
          padding: '16px', 
          backgroundColor: 'rgba(255, 255, 255, 0.9)', 
          borderRadius: '10px', 
          border: '2px solid #5A8C3A', 
          boxShadow: '0 2px 6px rgba(45, 80, 22, 0.06)', 
          transition: 'all 0.2s'
        }} 
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(45, 80, 22, 0.12)';
        }} 
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 6px rgba(45, 80, 22, 0.06)';
        }}>
          <p style={{
            fontSize: '10px', 
            color: '#5A8C3A', 
            textTransform: 'uppercase', 
            fontWeight: '700', 
            margin: '0 0 6px 0', 
            letterSpacing: '0.5px'
          }}>
            OR #
          </p>
          <p style={{fontSize: '15px', fontWeight: '700', color: '#1a3a0f', margin: 0}}>
            {formData.orNumber || '-'}
          </p>
        </div>
      </div>
    </div>
    
    {/* Section 1: Policy Information */}
    <div style={{
      marginBottom: '10px', 
      padding: '15px', 
      backgroundColor: 'rgba(255, 255, 255, 0.6)', 
      borderRadius: '10px', 
      border: '1px solid rgba(90, 140, 58, 0.2)'
    }}>
      <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px'}}>
        <div style={{width: '4px', height: '22px', backgroundColor: '#5A8C3A', borderRadius: '2px'}}></div>
        <h4 style={{
          fontSize: '13px', 
          fontWeight: '700', 
          color: '#2D5016', 
          margin: 0, 
          textTransform: 'uppercase', 
          letterSpacing: '0.3px'
        }}>
          Policy Information
        </h4>
      </div>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px'}}>
        <div style={{
          padding: '12px', 
          backgroundColor: 'rgba(248, 250, 252, 0.8)', 
          borderRadius: '8px', 
          border: '3px solid #a7d49b'
        }}>
          <p style={{fontSize: '10px', color: '#5A8C3A', textTransform: 'uppercase', fontWeight: '600', margin: '0 0 4px 0'}}>Type</p>
          <p style={{fontSize: '14px', fontWeight: '600', color: '#1a3a0f', margin: 0}}>{formData.cType || '-'}</p>
        </div>
        <div style={{
          padding: '12px', 
          backgroundColor: 'rgba(248, 250, 252, 0.8)', 
          borderRadius: '8px', 
          border: '3px solid #a7d49b'
        }}>
          <p style={{fontSize: '10px', color: '#5A8C3A', textTransform: 'uppercase', fontWeight: '600', margin: '0 0 4px 0'}}>Policy #</p>
          <p style={{fontSize: '14px', fontWeight: '600', color: '#1a3a0f', margin: 0}}>{formData.policyNumber || '-'}</p>
        </div>
        <div style={{
          padding: '12px', 
          backgroundColor: 'rgba(248, 250, 252, 0.8)', 
          borderRadius: '8px', 
          border: '3px solid #a7d49b'
        }}>
          <p style={{fontSize: '10px', color: '#5A8C3A', textTransform: 'uppercase', fontWeight: '600', margin: '0 0 4px 0'}}>Issued</p>
          <p style={{fontSize: '14px', fontWeight: '600', color: '#1a3a0f', margin: 0}}>{formData.dateIssued || '-'}</p>
        </div>
        <div style={{
          padding: '12px', 
          backgroundColor: 'rgba(248, 250, 252, 0.8)', 
          borderRadius: '8px', 
          border: '3px solid #a7d49b'
        }}>
          <p style={{fontSize: '10px', color: '#5A8C3A', textTransform: 'uppercase', fontWeight: '600', margin: '0 0 4px 0'}}>Received</p>
          <p style={{fontSize: '14px', fontWeight: '600', color: '#1a3a0f', margin: 0}}>{formData.dateReceived || '-'}</p>
        </div>
      </div>
    </div>

    {/* Section 2: Insurance Period */}
    <div style={{
      marginBottom: '12px', 
      padding: '15px', 
      backgroundColor: 'rgba(255, 255, 255, 0.6)', 
      borderRadius: '10px', 
      border: '1px solid rgba(90, 140, 58, 0.2)'
    }}>
      <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px'}}>
        <div style={{width: '4px', height: '22px', backgroundColor: '#5A8C3A', borderRadius: '2px'}}></div>
        <h4 style={{
          fontSize: '13px', 
          fontWeight: '700', 
          color: '#2D5016', 
          margin: 0, 
          textTransform: 'uppercase', 
          letterSpacing: '0.3px'
        }}>
          Insurance Period
        </h4>
      </div>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
        <div style={{
          padding: '14px', 
          backgroundColor: 'rgba(248, 250, 252, 0.8)', 
          borderRadius: '8px', 
          border: '3px solid #a7d49b'
        }}>
          <p style={{fontSize: '10px', color: '#5A8C3A', textTransform: 'uppercase', fontWeight: '600', margin: '0 0 4px 0'}}>From</p>
          <p style={{fontSize: '14px', fontWeight: '600', color: '#1a3a0f', margin: 0}}>
            {formData.insuranceFromDate ? `${formData.insuranceFromDate} ${formData.insuranceFromTime}` : '-'}
          </p>
        </div>
        <div style={{
          padding: '12px', 
          backgroundColor: 'rgba(248, 250, 252, 0.8)', 
          borderRadius: '8px', 
          border: '3px solid #a7d49b'
        }}>
          <p style={{fontSize: '10px', color: '#5A8C3A', textTransform: 'uppercase', fontWeight: '600', margin: '0 0 4px 0'}}>To</p>
          <p style={{fontSize: '14px', fontWeight: '600', color: '#1a3a0f', margin: 0}}>
            {formData.insuranceToDate ? `${formData.insuranceToDate} ${formData.insuranceToTime}` : '-'}
          </p>
        </div>
      </div>
    </div>

    {/* Section 3: Vehicle Details */}
    <div style={{
      marginBottom: '12px', 
      padding: '15px', 
      backgroundColor: 'rgba(255, 255, 255, 0.6)', 
      borderRadius: '10px', 
      border: '1px solid rgba(90, 140, 58, 0.2)'
    }}>
      <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px'}}>
        <div style={{width: '4px', height: '22px', backgroundColor: '#5A8C3A', borderRadius: '2px'}}></div>
        <h4 style={{
          fontSize: '13px', 
          fontWeight: '700', 
          color: '#2D5016', 
          margin: 0, 
          textTransform: 'uppercase', 
          letterSpacing: '0.3px'
        }}>
          Vehicle Details
        </h4>
      </div>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px', marginBottom: '10px'}}>
        <div style={{padding: '10px', backgroundColor: 'rgba(248, 250, 252, 0.8)', borderRadius: '8px', border: '3px solid #a7d49b'}}>
          <p style={{fontSize: '9px', color: '#5A8C3A', textTransform: 'uppercase', fontWeight: '600', margin: '0 0 3px 0'}}>Model</p>
          <p style={{fontSize: '13px', fontWeight: '600', color: '#1a3a0f', margin: 0}}>{formData.model || '-'}</p>
        </div>
        <div style={{padding: '10px', backgroundColor: 'rgba(248, 250, 252, 0.8)', borderRadius: '8px', border: '3px solid #a7d49b'}}>
          <p style={{fontSize: '9px', color: '#5A8C3A', textTransform: 'uppercase', fontWeight: '600', margin: '0 0 3px 0'}}>Make</p>
          <p style={{fontSize: '13px', fontWeight: '600', color: '#1a3a0f', margin: 0}}>{formData.make || '-'}</p>
        </div>
        <div style={{padding: '10px', backgroundColor: 'rgba(248, 250, 252, 0.8)', borderRadius: '8px', border: '3px solid #a7d49b'}}>
          <p style={{fontSize: '9px', color: '#5A8C3A', textTransform: 'uppercase', fontWeight: '600', margin: '0 0 3px 0'}}>Body Type</p>
          <p style={{fontSize: '13px', fontWeight: '600', color: '#1a3a0f', margin: 0}}>{formData.bodyType || '-'}</p>
        </div>
        <div style={{padding: '10px', backgroundColor: 'rgba(248, 250, 252, 0.8)', borderRadius: '8px', border: '3px solid #a7d49b'}}>
          <p style={{fontSize: '9px', color: '#5A8C3A', textTransform: 'uppercase', fontWeight: '600', margin: '0 0 3px 0'}}>Color</p>
          <p style={{fontSize: '13px', fontWeight: '600', color: '#1a3a0f', margin: 0}}>{formData.color || '-'}</p>
        </div>
      </div>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px'}}>
        <div style={{padding: '10px', backgroundColor: 'rgba(248, 250, 252, 0.8)', borderRadius: '8px', border: '3px solid #a7d49b'}}>
          <p style={{fontSize: '9px', color: '#5A8C3A', textTransform: 'uppercase', fontWeight: '600', margin: '0 0 3px 0'}}>MV File</p>
          <p style={{fontSize: '13px', fontWeight: '600', color: '#1a3a0f', margin: 0}}>{formData.mvFileNo || '-'}</p>
        </div>
        <div style={{padding: '10px', backgroundColor: 'rgba(248, 250, 252, 0.8)', borderRadius: '8px', border: '3px solid #a7d49b'}}>
          <p style={{fontSize: '9px', color: '#5A8C3A', textTransform: 'uppercase', fontWeight: '600', margin: '0 0 3px 0'}}>Plate</p>
          <p style={{fontSize: '13px', fontWeight: '600', color: '#1a3a0f', margin: 0}}>{formData.plateNo || '-'}</p>
        </div>
        <div style={{padding: '10px', backgroundColor: 'rgba(248, 250, 252, 0.8)', borderRadius: '8px', border: '3px solid #a7d49b'}}>
          <p style={{fontSize: '9px', color: '#5A8C3A', textTransform: 'uppercase', fontWeight: '600', margin: '0 0 3px 0'}}>Chassis</p>
          <p style={{fontSize: '13px', fontWeight: '600', color: '#1a3a0f', margin: 0}}>{formData.serialChassisNo || '-'}</p>
        </div>
        <div style={{padding: '10px', backgroundColor: 'rgba(248, 250, 252, 0.8)', borderRadius: '8px', border: '3px solid #a7d49b'}}>
          <p style={{fontSize: '9px', color: '#5A8C3A', textTransform: 'uppercase', fontWeight: '600', margin: '0 0 3px 0'}}>Motor</p>
          <p style={{fontSize: '13px', fontWeight: '600', color: '#1a3a0f', margin: 0}}>{formData.motorNo || '-'}</p>
        </div>
      </div>
    </div>

    {/* Section 4: Insurance Rates - Highlighted */}
    <div style={{
      marginBottom: '12px', 
      padding: '15px', 
      background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', 
      borderRadius: '12px', 
      border: '2px solid #6ee7b7', 
      boxShadow: '0 4px 12px rgba(45, 80, 22, 0.1)'
    }}>
      <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px'}}>
        <div style={{width: '5px', height: '24px', backgroundColor: '#059669', borderRadius: '3px'}}></div>
        <h4 style={{
          fontSize: '14px', 
          fontWeight: '800', 
          color: '#065f46', 
          margin: 0, 
          textTransform: 'uppercase', 
          letterSpacing: '0.5px'
        }}>
          Insurance Rates
        </h4>
      </div>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', marginBottom: '16px'}}>
        <div style={{
          padding: '10px', 
          backgroundColor: 'rgba(255, 255, 255, 0.9)', 
          borderRadius: '8px', 
          border: '2px solid #a7f3d0', 
          textAlign: 'center', 
          transition: 'all 0.2s'
        }} 
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.borderColor = '#6ee7b7';
        }} 
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = '#a7f3d0';
        }}>
          <p style={{fontSize: '10px', color: '#059669', fontWeight: '700', margin: '0 0 4px 0', textTransform: 'uppercase'}}>Premium</p>
          <p style={{fontSize: '13px', fontWeight: '800', color: '#064e3b', margin: 0}}>₱{rates.premium.toFixed(2)}</p>
        </div>
        <div style={{
          padding: '10px', 
          backgroundColor: 'rgba(255, 255, 255, 0.9)', 
          borderRadius: '8px', 
          border: '2px solid #a7f3d0', 
          textAlign: 'center', 
          transition: 'all 0.2s'
        }} 
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.borderColor = '#6ee7b7';
        }} 
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = '#a7f3d0';
        }}>
          <p style={{fontSize: '10px', color: '#059669', fontWeight: '700', margin: '0 0 4px 0', textTransform: 'uppercase'}}>Stamps</p>
          <p style={{fontSize: '13px', fontWeight: '800', color: '#064e3b', margin: 0}}>₱{rates.docStamps.toFixed(2)}</p>
        </div>
        <div style={{
          padding: '10px', 
          backgroundColor: 'rgba(255, 255, 255, 0.9)', 
          borderRadius: '8px', 
          border: '2px solid #a7f3d0', 
          textAlign: 'center', 
          transition: 'all 0.2s'
        }} 
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.borderColor = '#6ee7b7';
        }} 
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = '#a7f3d0';
        }}>
          <p style={{fontSize: '10px', color: '#059669', fontWeight: '700', margin: '0 0 4px 0', textTransform: 'uppercase'}}>VAT</p>
          <p style={{fontSize: '13px', fontWeight: '800', color: '#064e3b', margin: 0}}>₱{rates.eVat.toFixed(2)}</p>
        </div>
        <div style={{
          padding: '10px', 
          backgroundColor: 'rgba(255, 255, 255, 0.9)', 
          borderRadius: '8px', 
          border: '2px solid #a7f3d0', 
          textAlign: 'center', 
          transition: 'all 0.2s'
        }} 
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.borderColor = '#6ee7b7';
        }} 
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = '#a7f3d0';
        }}>
          <p style={{fontSize: '10px', color: '#059669', fontWeight: '700', margin: '0 0 4px 0', textTransform: 'uppercase'}}>LGT</p>
          <p style={{fontSize: '13px', fontWeight: '800', color: '#064e3b', margin: 0}}>₱{rates.lgt.toFixed(2)}</p>
        </div>
        <div style={{
          padding: '10px', 
          backgroundColor: 'rgba(255, 255, 255, 0.9)', 
          borderRadius: '8px', 
          border: '2px solid #a7f3d0', 
          textAlign: 'center', 
          transition: 'all 0.2s'
        }} 
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.borderColor = '#6ee7b7';
        }} 
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = '#a7f3d0';
        }}>
          <p style={{fontSize: '10px', color: '#059669', fontWeight: '700', margin: '0 0 4px 0', textTransform: 'uppercase'}}>Fee</p>
          <p style={{fontSize: '13px', fontWeight: '800', color: '#064e3b', margin: 0}}>₱{rates.authFee.toFixed(2)}</p>
        </div>
        <div style={{
          padding: '10px', 
          backgroundColor: 'rgba(255, 255, 255, 0.9)', 
          borderRadius: '8px', 
          border: '2px solid #a7f3d0', 
          textAlign: 'center', 
          transition: 'all 0.2s'
        }} 
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.borderColor = '#6ee7b7';
        }} 
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = '#a7f3d0';
        }}>
          <p style={{fontSize: '10px', color: '#059669', fontWeight: '700', margin: '0 0 4px 0', textTransform: 'uppercase'}}>Other</p>
          <p style={{fontSize: '13px', fontWeight: '800', color: '#064e3b', margin: 0}}>₱{rates.otherCharges.toFixed(2)}</p>
        </div>
      </div>
      <div style={{
        padding: '16px 20px', 
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
        borderRadius: '10px', 
        textAlign: 'center', 
        boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
      }}>
        <p style={{
          fontSize: '15px', 
          color: '#d1fae5', 
          margin: '0 0 4px 0', 
          fontWeight: '700', 
          textTransform: 'uppercase', 
          letterSpacing: '1px'
        }}>
          Grand Total
        </p>
        <p style={{fontSize: '30px', fontWeight: '900', color: '#ffffff', margin: 0, letterSpacing: '-0.5px'}}>
          ₱{rates.total.toFixed(2)}
        </p>
      </div>
    </div>

    {/* Ready to Submit Notice */}
    <div style={{
      padding: '16px 20px', 
      background: 'linear-gradient(90deg, #d1fae5 0%, #a7f3d0 100%)', 
      borderRadius: '10px', 
      border: '2px solid #6ee7b7', 
      display: 'flex', 
      alignItems: 'center', 
      gap: '12px', 
      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.15)'
    }}>
      <div style={{
        width: '32px', 
        height: '32px', 
        borderRadius: '50%', 
        backgroundColor: '#10b981', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        flexShrink: 0
      }}>
        <span style={{fontSize: '18px', color: 'white', fontWeight: 'bold'}}>✓</span>
      </div>
      <p style={{fontSize: '13px', color: '#065f46', margin: 0, fontWeight: '600', lineHeight: '1.5'}}>
        All information verified and ready to submit. Click <strong>Submit</strong> below to finalize your application.
      </p>
    </div>
  </div>
)}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '12px', marginBottom: '5px'}}>
          <button 
            onClick={handleBack}
            aria-label="Cancel and return to records"
            onFocus={(e) => {
              e.target.style.boxShadow = '0 0 0 3px rgba(209, 213, 219, 0.5)';
            }}
            onBlur={(e) => {
              e.target.style.boxShadow = '';
            }}
            style={{
              padding: '12px 28px',
              backgroundColor: '#e5e7eb',
              color: '#374151',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#d1d5db';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#e5e7eb';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '';
            }}
          >
            Cancel
          </button>

          {currentStep === 1 && (
            <button 
              onClick={handleClearForm}
              aria-label="Clear all form data"
              onFocus={(e) => {
                e.target.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = '';
              }}
              style={{
                padding: '12px 28px',
                backgroundColor: '#fee2e2',
                color: '#991b1b',
                border: '1.5px solid #fecaca',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#fca5a5';
                e.target.style.borderColor = '#ef4444';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 8px rgba(239, 68, 68, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#fee2e2';
                e.target.style.borderColor = '#fecaca';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '';
              }}
            >
              Clear Form
            </button>
          )}

          {currentStep > 1 && (
            <button 
              onClick={handlePrevious}
              aria-label={`Go back to previous step from step ${currentStep}`}
              onFocus={(e) => {
                e.target.style.boxShadow = '0 0 0 3px rgba(243, 244, 246, 0.5)';
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = '';
              }}
              style={{
                padding: '12px 28px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: '1.5px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#e5e7eb';
                e.target.style.borderColor = '#9ca3af';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#f3f4f6';
                e.target.style.borderColor = '#d1d5db';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '';
              }}
            >
              Previous
            </button>
          )}

          <button 
            onClick={handleNext}
            disabled={isSubmitting}
            aria-label={currentStep === 1 ? 'Continue to rates step' : currentStep === 2 ? 'Go to review step' : 'Submit form for processing'}
            aria-disabled={isSubmitting}
            onFocus={(e) => {
              if (!isSubmitting) {
                e.target.style.boxShadow = '0 0 0 4px rgba(255, 219, 88, 0.4)';
              }
            }}
            onBlur={(e) => {
              e.target.style.boxShadow = '';
            }}
            style={{
              padding: '12px 28px',
              backgroundColor: isSubmitting ? '#d1d5db' : '#FFDB58',
              color: '#2D5016',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              if (isSubmitting) return;
              e.target.style.backgroundColor = '#FFC93D';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 16px rgba(255, 219, 88, 0.3)';
            }}
            onMouseLeave={(e) => {
              if (isSubmitting) return;
              e.target.style.backgroundColor = '#FFDB58';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '';
            }}
          >
            {isSubmitting && (
              <div style={{
                width: '16px',
                height: '16px',
                border: '3px solid rgba(45, 80, 22, 0.2)',
                borderRadius: '50%',
                borderTopColor: '#2D5016',
                animation: 'spin 0.8s linear infinite'
              }}></div>
            )}
            {isSubmitting 
              ? 'Submitting...' 
              : currentStep === 1 ? 'Continue to Rates' : currentStep === 2 ? 'Go to Review' : 'Submit'}
          </button>
        </div>
        
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}

export default Menu;
