require('dotenv').config();
const { generateInvoice } = require('./invoice');
const { sendOrderConfirmationEmail } = require('./email');
const fs = require('fs');

// Test with your EXACT order structure
const testOrder = {
    _id: "6969c677ea950f90e69772a3",
    orderId: "ORD-65C3FA3C",
    userId: "SPj89cvs4khK0lhE7cP3T4MWueg2",
    items: [
        {
            id: "1",
            name: "Wireless Bluetooth Headphones",
            price: 429.99,
            quantity: 1,
            image: "/products/headphones.jpg"
        }
    ],
    shippingAddress: {
        street: "Dhaka",
        city: "Barisal Sadar",
        district: "Barisal",
        division: "Barisal",
        zipCode: "1234",
        country: "Bangladesh"
    },
    paymentMethod: "Credit Card",
    paymentStatus: "completed",
    status: "confirmed",
    subtotal: 429.99,
    shipping: 0,
    tax: 42.999,
    total: 472.989,
    createdAt: "2026-01-16T05:02:47.641+00:00",
    updatedAt: "2026-01-16T05:03:23.184+00:00"
};

const testPayment = {
    transactionId: "pi_3QmDvJBCsdJULiP31234567890",
    amount: 472.99,
    paymentMethod: "Credit Card",
    status: "succeeded",
    currency: "usd"
};

async function testInvoiceAndEmail() {
    console.log('🧪 Starting Email & Invoice Test...\n');

    try {
        // Step 1: Generate Invoice PDF
        console.log('📄 Generating invoice PDF...');
        const invoicePDF = await generateInvoice({
            order: testOrder,
            payment: testPayment
        });
        console.log('✅ Invoice generated successfully!');
        console.log(`   Size: ${(invoicePDF.length / 1024).toFixed(2)} KB\n`);

        // Step 2: Save PDF to file for manual inspection
        const filename = `test-invoice-${testOrder.orderId}.pdf`;
        fs.writeFileSync(filename, invoicePDF);
        console.log(`✅ Invoice saved to: ${filename}`);
        console.log('   You can open this file to verify the PDF looks correct.\n');

        // Step 3: Send Email
        const recipientEmail = process.env.TEST_EMAIL;

        if (!recipientEmail) {
            console.log('⚠️  Skipping email test - no recipient email configured');
            console.log('   Set TEST_EMAIL or EMAIL_USER in .env to test email sending\n');
            return;
        }

        console.log(`📧 Sending test email to: ${recipientEmail}...`);

        const emailResult = await sendOrderConfirmationEmail({
            customerEmail: recipientEmail,
            order: testOrder,
            payment: testPayment,
            invoicePDF
        });

        console.log('✅ Email sent successfully!');
        console.log(`   Message ID: ${emailResult.messageId}`);
        console.log(`   Check your inbox: ${recipientEmail}\n`);

        // Step 4: Summary
        console.log('✅ ALL TESTS PASSED!\n');
        console.log('Next steps:');
        console.log('1. Open the generated PDF file to verify it looks correct');
        console.log('2. Check your email inbox for the confirmation email');
        console.log('3. Verify the email template displays properly');
        console.log('4. Make sure the PDF attachment opens correctly\n');

    } catch (error) {
        console.error('❌ TEST FAILED:', error.message);
        console.error('\nError details:', error);

        if (error.message.includes('Invalid login')) {
            console.log('\n💡 Email authentication failed. Make sure:');
            console.log('   1. EMAIL_USER and EMAIL_PASSWORD are set in .env');
            console.log('   2. You are using an App Password (not regular Gmail password)');
            console.log('   3. 2FA is enabled on your Google account');
        }
    }
}

// Run the test
console.log('='.repeat(60));
console.log('  Email & Invoice Testing Tool');
console.log('='.repeat(60));
console.log();

testInvoiceAndEmail()
    .then(() => {
        console.log('='.repeat(60));
        process.exit(0);
    })
    .catch(err => {
        console.error('Fatal error:', err);
        process.exit(1);
    });
