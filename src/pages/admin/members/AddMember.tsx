import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, User, Mail, Lock, Phone, MapPin, Calendar, Globe, CreditCard, UserPlus, Shield, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { userService } from '@/services/modules/user.service';
import { roleService } from '@/services/modules/role.service';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import AdminLayout from '@/components/layout/AdminLayout';

const AddMember: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [roles, setRoles] = useState<{ roleid: string; rolename: string }[]>([]);

  const [formData, setFormData] = useState({
    roleid: '',
    displayname: '',
    email: '',
    username: '', // Optional, can be same as email
    password: '',
    phonenumber: '',
    address: '',
    dateofbirth: '',
    preferredlanguage: 'en',
    gender: '',
    identitycard: '',
    avatar: '',
  });

  useEffect(() => {
    // Fetch all roles from API
    const fetchRoles = async () => {
      try {
        const res = await roleService.getAll();
        setRoles(res.data || []);
      } catch (err) {
        toast.error('Failed to fetch roles');
      }
    };
    fetchRoles();
  }, []);

  const validateField = (name: string, value: string) => {
    const errors: Record<string, string> = {};
    
    switch (name) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (value && !emailRegex.test(value)) {
          errors.email = 'Please enter a valid email address';
        }
        break;
      case 'password':
        if (value && value.length < 6) {
          errors.password = 'Password must be at least 6 characters long';
        }
        break;
      case 'phoneNumber':
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (value && !phoneRegex.test(value.replace(/\s/g, ''))) {
          errors.phoneNumber = 'Please enter a valid phone number';
        }
        break;
      case 'username':
        if (value && value.length < 3) {
          errors.username = 'Username must be at least 3 characters long';
        }
        break;
    }
    
    setValidationErrors(prev => ({
      ...prev,
      ...errors,
      [name]: errors[name] || ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Validate all fields before submission
    const requiredFields = [ 'displayname', 'email', 'password', 'address', 'dateofbirth', 'gender'];
    const errors: Record<string, string> = {}; 
    requiredFields.forEach(field => {
      if (!formData[field as keyof typeof formData]) {
        errors[field] = 'This field is required';
      }
    });

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const formDataToSend = {
        ...formData,
        username: formData.email, // Use email as username if not provided
        roleid: roles[0]?.roleid || '' // Use selected role or default
      };
      console.log('Sending data to userService.create:', formDataToSend);
      const response = await userService.create(formDataToSend);
      console.log('Response from userService.create:', response);
      if (response.data) {
        toast.success('Member added successfully!');
        navigate('/admin/members');
      } else {
        toast.error(response.message || 'Failed to add member');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add member';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Validate field on change
    validateField(name, value);
  };

  const nextStep = () => {
    const step1Fields = [ 'displayname', 'email', "password"];
    const hasStep1Errors = step1Fields.some(field => 
      !formData[field as keyof typeof formData] || validationErrors[field]
    );
  
    
    if (hasStep1Errors) {
      toast.error('Please complete all required fields in this section');
      return;
    }
    
    setCurrentStep(2);
  };

  const prevStep = () => {
    setCurrentStep(1);
  };

  const renderFormStep = () => {
    if (currentStep === 1) {
      return (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <div className="p-4 bg-blue-500/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <User className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Basic Information</h3>
            <p className="text-slate-400">Enter the member's basic account details</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* <div className="relative">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Role <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <select
                  name="roleid"
                  value={formData.roleid}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 bg-slate-800/50 border ${
                    validationErrors.roleid ? 'border-red-500' : 'border-slate-600/50'
                  } rounded-lg text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all `}
                  required
                >
                  <option value="">Select role</option>
                  {roles.map(role => (
                    <option key={role.roleid} value={role.roleid}>
                      {role.rolename}
                    </option>
                  ))}
                </select>
              </div>
              {validationErrors.roleid && (
                <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {validationErrors.roleid}
                </p>
              )}
            </div> */}

            <div className="relative">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Display Name <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  name="displayname"
                  value={formData.displayname}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 bg-slate-800/50 border ${
                    validationErrors.displayname ? 'border-red-500' : 'border-slate-600/50'
                  } rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all`}
                  placeholder="Enter display name"
                  required
                />
              </div>
              {validationErrors.displayname && (
                <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {validationErrors.displayname}
                </p>
              )}
            </div>

            {/* <div className="relative hidden">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Username <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 bg-slate-800/50 border ${
                    validationErrors.email ? 'border-red-500' : 'border-slate-600/50'
                  } rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all`}
                  placeholder="Enter username"
                  required
                />
              </div>
              {validationErrors.email && (
                <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {validationErrors.email}
                </p>
              )}
            </div> */}

            <div className="relative">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email Address <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 bg-slate-800/50 border ${
                    validationErrors.email ? 'border-red-500' : 'border-slate-600/50'
                  } rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all`}
                  placeholder="Enter email address"
                  required
                />
              </div>
              {validationErrors.email && (
                <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {validationErrors.email}
                </p>
              )}
            </div>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Password <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                className={`w-full pl-10 pr-12 py-3 bg-slate-800/50 border ${
                  validationErrors.password ? 'border-red-500' : 'border-slate-600/50'
                } rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all`}
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {validationErrors.password && (
              <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.password}
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={nextStep}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
            >
              Continue
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <div className="p-4 bg-emerald-500/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <UserPlus className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Personal Details</h3>
          <p className="text-slate-400">Complete the member's profile information</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                name="phonenumber"
                type="tel"
                value={formData.phonenumber}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 bg-slate-800/50 border ${
                  validationErrors.phonenumber ? 'border-red-500' : 'border-slate-600/50'
                } rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all`}
                placeholder="Enter phone number"
              />
            </div>
            {validationErrors.phonenumber && (
              <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.phonenumber}
              </p>
            )}
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Date of Birth <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                name="dateofbirth"
                type="date"
                value={formData.dateofbirth}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 bg-slate-800/50 border ${
                  validationErrors.dateofbirth ? 'border-red-500' : 'border-slate-600/50'
                } rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all`}
                required
              />
            </div>
            {validationErrors.dateofbirth && (
              <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.dateofbirth}
              </p>
            )}
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Gender <span className="text-red-400">*</span>
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-slate-800/50 border ${
                validationErrors.gender ? 'border-red-500' : 'border-slate-600/50'
              } rounded-lg text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all appearance-none`}
              required
            >
              <option value="">Select gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
            {validationErrors.gender && (
              <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.gender}
              </p>
            )}
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Preferred Language
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <select
                name="preferredlanguage"
                value={formData.preferredlanguage}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all appearance-none"
              >
                <option value="en">English</option>
                <option value="vi">Vietnamese</option>
                <option value="fr">French</option>
                <option value="es">Spanish</option>
              </select>
            </div>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Identity Card
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                name="identitycard"
                value={formData.identitycard}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                placeholder="Enter identity card number"
              />
            </div>
          </div>
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Address <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              className={`w-full pl-10 pr-4 py-3 bg-slate-800/50 border ${
                validationErrors.address ? 'border-red-500' : 'border-slate-600/50'
              } rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none`}
              placeholder="Enter full address"
              required
            />
          </div>
          {validationErrors.address && (
            <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {validationErrors.address}
            </p>
          )}
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={prevStep}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Adding Member...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Add Member
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/admin/members')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white rounded-lg transition-all duration-200 backdrop-blur border border-slate-700/50"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Members
            </button>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white">Add New Member</h1>
              <p className="text-slate-400 mt-1">Create a new member account</p>
            </div>
            <div className="w-32"></div> {/* Spacer for centering */}
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
              currentStep === 1 
                ? 'bg-blue-500/10 border-blue-500/50 text-blue-400' 
                : 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                currentStep === 1 ? 'bg-blue-400' : 'bg-emerald-400'
              }`}></div>
              <span className="text-sm font-medium">Basic Info</span>
            </div>
            <div className={`w-12 h-0.5 transition-colors ${
              currentStep === 2 ? 'bg-emerald-400' : 'bg-slate-600'
            }`}></div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
              currentStep === 2 
                ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' 
                : 'bg-slate-700/50 border-slate-600/50 text-slate-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                currentStep === 2 ? 'bg-emerald-400' : 'bg-slate-400'
              }`}></div>
              <span className="text-sm font-medium">Personal Details</span>
            </div>
          </div>

          {/* Form Container */}
          <div className="bg-slate-800/30 backdrop-blur border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden">
            <form onSubmit={handleSubmit} className="p-8">
              {renderFormStep()}
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AddMember;