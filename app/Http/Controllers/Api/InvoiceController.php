<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use DB;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    public function index(Request $request)
    {
        // بدل Invoice::all()، هنجيب فواتير اليوزر ده بس
        // مع عمل Eager Loading للعميل (customer) عشان البيانات تظهر كاملة
        $invoices = $request->user()->invoices()->with('customer')->get();

        if ($invoices->isEmpty()) {
            return response()->json([
                'status' => true,
                'message' => 'لا يوجد فواتير مسجلة لهذا المستخدم حتى الآن',
                'data' => []
            ]);
        }

        return response()->json([
            'status' => true,
            'message' => 'تم جلب فواتيرك بنجاح',
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

                return $this->success($invoice, 'تم إضافة الفاتورة والأصناف بنجاح');
            });

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'حدث خطأ أثناء حفظ البيانات، تم إلغاء العملية',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function show($id, Request $request)
    {
        // بنجيب الفاتورة بشرط إنها تكون بتاعة اليوزر اللي عامل Login حالياً
        // وبنعمل Eager Loading للعميل وللأصناف ومعاها بيانات المنتجات كمان!
        $invoice = $request->user()->invoices()
            ->with(['customer', 'items.product'])
            ->find($id);

        if (!$invoice) {
            return response()->json([
                'status' => false,
                'message' => 'عفواً، الفاتورة غير موجودة أو غير مصرح لك بعرضها'
            ], 404);
        }

        return response()->json([
            'status' => true,
            'message' => 'تم جلب تفاصيل الفاتورة بنجاح',
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
        return $this->success($invoice, 'تم تحديث الفاتورة بنجاح');
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
}
