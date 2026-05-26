<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    /**
     * Display a listing of admin users.
     */
    public function index(): Response
    {
        $users = User::with('roles')->get()->map(function ($user) {
            return [
                'id' => (string)$user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->hasRole('super_admin') ? 'super_admin' : 'admin',
                'is_active' => (bool)$user->is_active,
                'created_at' => $user->created_at->toISOString(),
            ];
        })->toArray();

        return Inertia::render('admin/users/index', [
            'users' => $users,
        ]);
    }

    /**
     * Show the form for creating a new administrator.
     */
    public function create(): Response
    {
        return Inertia::render('admin/users/create', [
            'activeCount' => User::where('is_active', true)->count(),
        ]);
    }

    /**
     * Store a newly created administrator.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'role' => 'required|string|in:admin', // Super Admin cannot be created via UI
            'password' => [
                'required',
                'string',
                Password::defaults(),
                'confirmed',
            ],
        ]);

        // Active admin count check
        $activeCount = User::where('is_active', true)->count();
        if ($activeCount >= 10) {
            throw ValidationException::withMessages([
                'email' => 'Batas Akun Aktif Terpenuhi: Maksimal 10 akun administrator dapat aktif secara bersamaan.',
            ]);
        }

        DB::transaction(function () use ($request) {
            $user = User::create([
                'name' => $request->name,
                'email' => strtolower($request->email),
                'password' => Hash::make($request->password),
                'is_active' => true,
            ]);

            $user->assignRole($request->role);
        });

        return redirect()->route('admin.users.index')->with('success', 'Akun administrator baru berhasil disimpan.');
    }

    /**
     * Show the form for editing the specified administrator.
     */
    public function edit($id): Response
    {
        $user = User::findOrFail($id);

        $mappedUser = [
            'id' => (string)$user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->hasRole('super_admin') ? 'super_admin' : 'admin',
            'is_active' => (bool)$user->is_active,
        ];

        $activeSuperAdminsCount = User::role('super_admin')->where('is_active', true)->count();
        $isLastActiveSuperAdmin = $user->hasRole('super_admin') && $user->is_active && $activeSuperAdminsCount <= 1;

        return Inertia::render('admin/users/edit', [
            'user' => $mappedUser,
            'isLastActiveSuperAdmin' => (bool)$isLastActiveSuperAdmin,
            'activeCount' => User::where('is_active', true)->count(),
        ]);
    }

    /**
     * Update the specified administrator.
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $currentUser = Auth::user();

        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $id,
            'role' => 'required|string|in:' . ($user->hasRole('super_admin') ? 'super_admin' : 'admin'), // Keep current role, no UI role change
            'is_active' => 'required|boolean',
        ];

        if ($request->filled('password')) {
            $rules['password'] = [
                'required',
                'string',
                Password::defaults(),
                'confirmed',
            ];
        }

        $request->validate($rules);

        // Safe-Lock Constraint 1: A logged-in Super Admin cannot deactivate or demote themselves.
        if ($currentUser && (string)$currentUser->id === (string)$id) {
            if (!$request->is_active) {
                throw ValidationException::withMessages([
                    'is_active' => 'Operasi Ditolak: Anda tidak dapat menonaktifkan akun Anda sendiri.',
                ]);
            }
            if ($request->role !== 'super_admin') {
                throw ValidationException::withMessages([
                    'role' => 'Operasi Ditolak: Anda tidak dapat menurunkan tingkat peran (demote) akun Anda sendiri.',
                ]);
            }
        }

        // Safe-Lock Constraint 2: Prevent deactivating or demoting the last active Super Admin.
        $wasActiveSuperAdmin = $user->hasRole('super_admin') && $user->is_active;
        if ($wasActiveSuperAdmin && ($request->role !== 'super_admin' || !$request->is_active)) {
            // Count total active super admins in the system
            $activeSuperAdmins = User::role('super_admin')->where('is_active', true)->get();
            if ($activeSuperAdmins->count() <= 1) {
                throw ValidationException::withMessages([
                    'role' => 'Operasi Ditolak: Harus ada minimal 1 akun Super Admin yang aktif untuk mencegah penguncian sistem (system lock-out).',
                ]);
            }
        }

        // Active admin capacity limit check (max 10)
        if ($request->is_active && !$user->is_active) {
            $activeCount = User::where('is_active', true)->count();
            if ($activeCount >= 10) {
                throw ValidationException::withMessages([
                    'is_active' => 'Batas Akun Aktif Terpenuhi: Maksimal 10 akun administrator dapat aktif secara bersamaan.',
                ]);
            }
        }

        DB::transaction(function () use ($request, $user) {
            $updateData = [
                'name' => $request->name,
                'email' => strtolower($request->email),
                'is_active' => (bool)$request->is_active,
            ];

            if ($request->filled('password')) {
                $updateData['password'] = Hash::make($request->password);
            }

            $user->update($updateData);
            $user->syncRoles([$request->role]);
        });

        return redirect()->route('admin.users.index')->with('success', 'Data administrator berhasil diperbarui.');
    }

    /**
     * Remove the specified administrator.
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $currentUser = Auth::user();

        // Safe-Lock Constraint 1: Cannot delete self.
        if ($currentUser && (string)$currentUser->id === (string)$id) {
            throw ValidationException::withMessages([
                'id' => 'Operasi Ditolak: Anda tidak dapat menghapus akun Anda sendiri.',
            ]);
        }

        // Safe-Lock Constraint 2: Cannot delete the last active Super Admin.
        $isActiveSuperAdmin = $user->hasRole('super_admin') && $user->is_active;
        if ($isActiveSuperAdmin) {
            $activeSuperAdmins = User::role('super_admin')->where('is_active', true)->get();
            if ($activeSuperAdmins->count() <= 1) {
                throw ValidationException::withMessages([
                    'id' => 'Operasi Ditolak: Harus ada minimal 1 akun Super Admin yang aktif untuk mencegah penguncian sistem (system lock-out).',
                ]);
            }
        }

        $user->delete();

        return redirect()->route('admin.users.index')->with('success', 'Akun administrator berhasil dihapus.');
    }
}
