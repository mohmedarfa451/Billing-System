<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id(); // PK
            $table->date('invoice_date');
            $table->decimal('total_amount', 12, 2)->default(0); // إجمالي الفاتورة
            $table->string('status')->default('draft'); // draft, paid, void
            $table->foreignId('customer_id')
                ->constrained('customers')
                ->onDelete('restrict');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
