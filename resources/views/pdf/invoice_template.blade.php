<style>
    /* بنستخدم CSS عادي جداً لتنسيق الفاتورة */
    .invoice-box {
        max-width: 800px;
        margin: auto;
        padding: 30px;
        border: 1px solid #eee;
    }

    table {
        width: 100%;
        line-height: inherit;
        text-align: left;
        border-collapse: collapse;
    }

    table th {
        background: #eee;
        border-bottom: 1px solid #ddd;
        font-weight: bold;
    }

    table td {
        padding: 5px;
        border-bottom: 1px solid #eee;
    }
</style>

<div class="invoice-box">
    <h2>Billing System - Graduation Project</h2>
    <p>Customer Name: {{ $invoice->customer->name }}</p>
    <p>Date: {{ $invoice->invoice_date }}</p>

    <table>
        <thead>
            <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Subtotal</th>
            </tr>
        </thead>
        <tbody>
            @foreach($invoice->items as $item) <tr>
                    <td>{{ $item->product_name }}</td>
                    <td>{{ $item->quantity }}</td>
                    <td>{{ number_format($item->unit_price, 2) }}</td>
                    <td>{{ number_format($item->subtotal, 2) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
    <h3 style="text-align: right;">Total: {{ number_format($invoice->total_amount, 2) }} EGP</h3>
</div>