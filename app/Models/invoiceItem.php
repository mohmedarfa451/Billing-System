<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class invoiceItem extends Model
{
    protected $table = "invoice_items";
    protected $fillable = [
        'quantity',
        'unit_price',
        'subtotal',
        'invoice_id',
        'product_id',
    ];
    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }

    // العنصر يشير لمنتج
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
