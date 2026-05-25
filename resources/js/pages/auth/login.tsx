import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasskeyVerify from '@/components/passkey-verify';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { KeyRound, Mail } from 'lucide-react';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    return (
        <>
            <Head title="Masuk Ke Panel Admin" />

            <PasskeyVerify />

            {status && (
                <div className="mb-4 rounded-xl border border-emerald-200/50 bg-emerald-50 p-3 text-center text-sm font-medium text-emerald-600">
                    {status}
                </div>
            )}

            <Form
                {...(store as any).form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="email"
                                    className="text-xs font-semibold tracking-wide text-neutral-700 uppercase"
                                >
                                    Alamat Email
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="email"
                                        placeholder="nama@umri.ac.id"
                                        className="h-11 rounded-xl border-neutral-300/80 pl-10 transition-all placeholder:text-neutral-400 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20"
                                    />
                                    <div className="absolute top-1/2 left-3.5 -translate-y-1/2 text-neutral-400">
                                        <Mail className="size-4.5" />
                                    </div>
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center justify-between">
                                    <Label
                                        htmlFor="password"
                                        className="text-xs font-semibold tracking-wide text-neutral-700 uppercase"
                                    >
                                        Kata Sandi
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="text-xs font-medium text-emerald-600 transition-colors hover:text-emerald-700"
                                            tabIndex={5}
                                        >
                                            Lupa password?
                                        </TextLink>
                                    )}
                                </div>
                                <div className="relative">
                                    <PasswordInput
                                        id="password"
                                        name="password"
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        placeholder="Masukkan kata sandi"
                                        className="h-11 rounded-xl border-neutral-300/80 pl-10 transition-all placeholder:text-neutral-400 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20"
                                    />
                                    <div className="absolute top-1/2 left-3.5 -translate-y-1/2 text-neutral-400">
                                        <KeyRound className="size-4.5" />
                                    </div>
                                </div>
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-2.5 py-1">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                    className="h-4.5 w-4.5 rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <Label
                                    htmlFor="remember"
                                    className="cursor-pointer text-sm text-neutral-600 select-none"
                                >
                                    Ingat saya di perangkat ini
                                </Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 h-11 w-full rounded-xl bg-emerald-600 text-sm font-semibold text-white shadow-md transition-all hover:scale-[1.01] hover:bg-emerald-700 hover:shadow-[0_4px_20px_rgba(16,185,129,0.25)] active:scale-[0.99] active:bg-emerald-800"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing ? (
                                    <>
                                        <Spinner className="mr-2" />
                                        Memproses...
                                    </>
                                ) : (
                                    'Masuk Ke Akun'
                                )}
                            </Button>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

Login.layout = {
    title: 'Masuk ke Panel',
    description: 'Gunakan akun resmi Biro Keuangan & Aset UMRI',
};
