<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use DB;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;

class InvoiceController extends Controller
{
    public function index(Request $request)
    {
        $invoices = $request->user()->invoices()->with('customer')->get();

        if ($invoices->isEmpty()) {
            return response()->json([
                'status' => true,
                'message' => 'No invoices recorded for this user yet',
                'data' => []
            ]);
        }

        return response()->json([
            'status' => true,
            'message' => 'Invoices retrieved successfully',
            'data' => $invoices
        ]);
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

        try {
            return DB::transaction(function () use ($validatedData, $request) {

                $invoiceData = collect($validatedData)->except('items')->toArray();

                $invoice = $request->user()->invoices()->create($invoiceData);

                $invoice->items()->createMany($validatedData['items']);

                return $this->success($invoice, 'Invoice and items added successfully');
            });

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'An error occurred while saving data, the process was cancelled',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function show($id, Request $request)
    {
        $invoice = $request->user()->invoices()

            ->with(['customer', 'items.product'])
            ->find($id);

        if (!$invoice) {
            return response()->json([
                'status' => false,
                'message' => 'Sorry, the invoice was not found or you are not authorized to view it'
            ], 404);
        }

        return response()->json([
            'status' => true,
            'message' => 'Invoice details retrieved successfully',
            'data' => $invoice
        ]);
    }
    public function update(Request $request, $id)
    {
        $invoice = Invoice::find($id);

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
        return $this->success($invoice, 'Invoice updated successfully');
    }
    public function destroy($id)
    {
        $invoice = Invoice::find($id);

        if (!$invoice) {
            return response()->json(['message' => 'Invoice not found'], 404);
        }

        $invoice->delete();

        return response()->json(['message' => 'Invoice deleted successfully'], 200);
    }
    public function downloadPDF($id)
    {
        // 2. بنجيب بيانات الفاتورة مع العميل والأصناف (Eager Loading) عشان منعملش لود ع الداتا بيز
        $invoice = Invoice::with(['customer', 'items'])->findOrFail($id);

        // 3. بنبعت البيانات دي لملف "رسم" (View) لسه هنكرتيه
        $pdf = Pdf::loadView('pdf.invoice_template', compact('invoice'));

        // 4. بنقول للسيرفر نزل الملف ده للكمبيوتر باسم فاتورة ورقمها
        return $pdf->download('invoice-' . $id . '.pdf');
    }
}
