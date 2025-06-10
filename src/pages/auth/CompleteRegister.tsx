import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserPlus, Mail, Phone, Home, Calendar, Languages, User, CreditCard, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import AuthService from '../../services/modules/auth.service';
import { roleService } from '../../services/modules/role.service';
import Layout from '../../components/layout/Layout';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { RegisterRequest } from '@/services/types/request.types';
import { userService } from '@/services/modules/user.service';

const CompleteRegister: React.FC = () => {
    const [formData, setFormData] = useState({
        roleid: '',
        displayname: '',
        username: '',
        email: '',
        phonenumber: '',
        password: '',
        confirmPassword: '',
        address: '',
        dateofbirth: '',
        preferredlanguage: 'vi',
        avatar: '',
        gender: '',
        identityCard: ''
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    useEffect(() => {
        if (!email) {
            navigate('/register');
            return;
        }
        setFormData(prev => ({ ...prev, email }));

        // Fetch member role
        const fetchMemberRole = async () => {
            try {
                const response = await roleService.getAll();
                const roles = response.data;
                const memberRole = roles.find((role: { rolename?: string; name?: string; roleid?: string }) => 
                    role.rolename?.toLowerCase() === 'member' ||
                    role.name?.toLowerCase() === 'member'
                );
                
                if (memberRole?.roleid) {
                    setFormData(prev => ({ ...prev, roleid: memberRole.roleid }));
                } else {
                    setError('Member role not found');
                }
            } catch (err) {
                console.error('Error fetching roles:', err);
                setError('Failed to fetch roles');
            }
        };

        fetchMemberRole();
    }, [email, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!formData.roleid) {
            setError('Role ID is missing. Please try again.');
            return;
        }

        try {
            setLoading(true);

            const registerData: RegisterRequest = {
                roleid: formData.roleid,
                displayname: formData.displayname,
                username: formData.username || formData.email, // Use email as username if not provided
                email: formData.email,
                phonenumber: formData.phonenumber,
                password: formData.password,
                address: formData.address,
                dateofbirth: formData.dateofbirth,
                preferredlanguage: formData.preferredlanguage,
                avatar: formData.avatar,
                gender: formData.gender,
                identityCard: formData.identityCard
            };

            await userService.create(registerData);
            navigate('/login', {
                state: { message: 'Registration successful! You can now log in.' }
            });
        } catch (err: any) {
            console.error('Registration error:', err);
            setError(err.response?.data?.message || 'Failed to complete registration');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="flex min-h-[calc(100vh-64px)] bg-secondary-50 dark:bg-secondary-900">
                <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
                    <div className="sm:mx-auto sm:w-full sm:max-w-md">
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-secondary-900 dark:text-white">
                            Complete Your Registration
                        </h2>
                        <p className="mt-2 text-center text-sm text-secondary-600 dark:text-secondary-400">
                            Please fill in your account details
                        </p>
                    </div>

                    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                        <div className="bg-white dark:bg-secondary-800 py-8 px-4 shadow-card sm:rounded-lg sm:px-10">
                            {error && (
                                <div className="mb-4 bg-accent-100 dark:bg-accent-900 border border-accent-200 dark:border-accent-800 text-accent-800 dark:text-accent-200 px-4 py-3 rounded-md">
                                    <p>{error}</p>
                                </div>
                            )}

                            <form className="space-y-6" onSubmit={handleSubmit}>
                                <Input
                                    id="displayname"
                                    name="displayname"
                                    type="text"
                                    label="Display Name"
                                    required
                                    value={formData.displayname}
                                    onChange={(e) => setFormData({ ...formData, displayname: e.target.value })}
                                    leftIcon={<User size={20} className="text-secondary-400" />}
                                />

                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    label="Email"
                                    required
                                    value={formData.email}
                                    disabled
                                    leftIcon={<Mail size={20} className="text-secondary-400" />}
                                />

                                <Input
                                    id="phonenumber"
                                    name="phonenumber"
                                    type="tel"
                                    label="Phone Number"
                                    required
                                    value={formData.phonenumber}
                                    onChange={(e) => setFormData({ ...formData, phonenumber: e.target.value })}
                                    leftIcon={<Phone size={20} className="text-secondary-400" />}
                                />

                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    label="Password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    leftIcon={<Lock size={20} className="text-secondary-400" />}
                                />

                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    label="Confirm Password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    leftIcon={<Lock size={20} className="text-secondary-400" />}
                                />

                                <Input
                                    id="address"
                                    name="address"
                                    type="text"
                                    label="Address"
                                    required
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    leftIcon={<Home size={20} className="text-secondary-400" />}
                                />

                                <Input
                                    id="dateofbirth"
                                    name="dateofbirth"
                                    type="date"
                                    label="Date of Birth"
                                    required
                                    value={formData.dateofbirth}
                                    onChange={(e) => setFormData({ ...formData, dateofbirth: e.target.value })}
                                    leftIcon={<Calendar size={20} className="text-secondary-400" />}
                                />

                                <Input
                                    id="identityCard"
                                    name="identityCard"
                                    type="text"
                                    label="Identity Card"
                                    required
                                    value={formData.identityCard}
                                    onChange={(e) => setFormData({ ...formData, identityCard: e.target.value })}
                                    leftIcon={<CreditCard size={20} className="text-secondary-400" />}
                                />

                                <div>
                                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                                        Gender
                                    </label>
                                    <select
                                        id="gender"
                                        name="gender"
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-secondary-300 dark:border-secondary-700 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-secondary-700"
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <Input
                                    id="preferredlanguage"
                                    name="preferredlanguage"
                                    type="text"
                                    label="Preferred Language"
                                    value={formData.preferredlanguage}
                                    onChange={(e) => setFormData({ ...formData, preferredlanguage: e.target.value })}
                                    leftIcon={<Languages size={20} className="text-secondary-400" />}
                                />

                                <Button
                                    type="submit"
                                    fullWidth
                                    isLoading={loading}
                                >
                                    {loading ? 'Creating Account...' : 'Complete Registration'}
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default CompleteRegister;
