<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\invoice;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    public function index()
    {
        return response()->json([
            'message' => 'Invoices retrieved successfully',
            'invoices' => invoice::with('customer', 'items')->get()
        ], 200);
    }
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'items' => 'required|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric',
            'items.*.subtotal' => 'required|numeric',
            'invoice_date' => 'required|date',
            'total_amount' => 'required',
            'status' => 'required|string',
        ]);

        $invoiceData = collect($validatedData)->except('items')->toArray();
        $invoice = invoice::create($invoiceData);
        $invoice->items()->createMany($validatedData['items']);
        return $this->success($invoice, 'تم إضافة الفاتورة بنجاح');
    }
    public function show($id)
    {
        $invoice = invoice::find($id);

        if (!$invoice) {
            return response()->json(['message' => 'Invoice not found'], 404);
        }

        return response()->json($invoice, 200);
    }
    public function update(Request $request, $id)
    {
        $invoice = invoice::find($id);

        if (!$invoice) {
            return response()->json(['message' => 'Invoice not found'], 404);
        }

        $validatedData = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'items' => 'required|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        $invoice->update($validatedData);
        return $this->success($invoice, 'تم تحديث الفاتورة بنجاح');
    }
    public function destroy($id)
    {
        $invoice = invoice::find($id);

        if (!$invoice) {
            return response()->json(['message' => 'Invoice not found'], 404);
        }

        $invoice->delete();

        return response()->json(['message' => 'Invoice deleted successfully'], 200);
    }
}
