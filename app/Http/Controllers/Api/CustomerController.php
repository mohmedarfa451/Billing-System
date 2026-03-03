<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index()
    {
        $customers = Customer::all();
        return $this->success($customers);

    }
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:customers,email',
            'phone' => 'required|string|max:20',
            'address' => 'required|string|max:255',
        ]);
        $customer = Customer::create($validated);
        return $this->success($customer);
    }
    public function show($id)
    {
        $customer = Customer::find($id);
        return $this->success($customer);
    }
    public function update(Request $request, $id)
    {
        $customer = Customer::find($id);
        $customer->update($request->all());
        return $this->success($customer);
    }
    public function destroy($id)
    {
        $customer = Customer::find($id);
        $customer->delete();
        return $this->success($customer);
    }
}
