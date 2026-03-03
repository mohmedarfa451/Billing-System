<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'name',
        'price',
        'description',
        'stock_quantity',
    ];
    public function invoiceItems()
    {
        return $this->hasMany(InvoiceItem::class);
    }
}
