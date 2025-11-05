import Coupon from "../models/coupon.model.js";
import {stripe} from "../lib/stripe.js";

/**
 * This function creates a new checkout session with Stripe. 
 * It takes an array of products and a coupon code as input.
 * It then calculates the total amount of the order and creates a new checkout session with Stripe.
 * If a coupon code is provided, it applies the discount to the total amount.
 * If the total amount is greater than or equal to $200, it creates a new coupon for the user.
 * Finally, it returns the ID of the checkout session and the total amount in dollars.
 */
export const createCheckoutSession = async(req,res) => {
    try {
        // Get the products and coupon code from the request body
        const {products, couponCode} = req.body;

        // Check if the products array is valid
        if(!Array.isArray(products) || products.length === 0){
            return res.status(400).json({ error:"Invalid or empty products array"});
        }

        // Calculate the total amount of the order
        let totalAmount = 0;
        const lineItems = products.map((product) => {
            const amount = product.price * 100; // Convert price to cents
            totalAmount += amount * product.quantity;

            return {
                price_data: {
                    currency : "usd",
                    product_data : {
                        name : product.name,
                        image : [product.image],
                    },
                    unit_amount : amount, 
                },
                quantity : product.quantity || 1 ,
            };
        });

        // Find the coupon if a coupon code is provided
        let coupon = null;
        if(couponCode) {
            coupon = await Coupon.findOne({ code: couponCode , userId: req.user._id, isActive: true});
        }

        // Apply the discount if a coupon is found
        if(coupon){
            totalAmount -= Math.round((totalAmount * coupon.discountPercentage) / 100 );
        }

        // Create a new checkout session with Stripe
        const session = await stripe.checkout.sessions.create({
            payment_method_types : ["card"],
            line_items: lineItems,
            mode : "payment",
            success_url : `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url : `${process.env.CLIENT_URL}/purchase-cancel`,
            discounts : coupon ?
             [
               {
                coupon : await createStripeCoupon(coupon.discountPercentage),
               },
            ] : [],
            metadata: {
                userId: req.user._id.toString(),
                couponCode: couponCode || "",
                products: JSON.stringify(
                    products.map( (product) => ({
                        id: product._id,
                        quantity: product.quantity,
                        price: product.price,
                    }))
                )
            }
        });

        // Create a new coupon if the total amount is greater than or equal to $200
        if(totalAmount >= 20000){
            await createNewCoupon(req.user._id);
        }

        // Return the ID of the checkout session and the total amount in dollars
        res.status(200).json({ id: session.id, totalAmount: totalAmount/100});
        
    } catch (error) {
        console.log("Error processing checkout");
        res.status(500).json({ message: "Error processing checkout", error: error.message});
    }
}

// We are creating a stripe coupon because we have a coupon in our own database,
// but Stripe does not have this coupon. Stripe uses its own coupon system,
// so we need to create a coupon in Stripe's system if we want to use it.
async function createStripeCoupon(discountPercentage) {
   const coupon = await stripe.coupons.create({
     percent_off: discountPercentage,
     duration: "once",
   })

   return coupon.id;
}

async function createNewCoupon(userId) {
    await Coupon.findOneAndDelete({userId}); //delete old coupon if exists

    const newCoupon = new Coupon({  
        code: "GIFT"+Math.random().toString(36).substring(2,8).toUpperCase(),  
        discountPercentage: 10,
        expirationDate: new Date(Date.now() + 30*24*60*60*1000), //30 days from now.
        userId: userId,
    });

    await newCoupon.save();

    return newCoupon;

    //generating code : 
    /* Math.random() : returns a random number between 0 (inclusive) and 1 (exclusive). for ex. 0.123456789
       toString(36) : converts the number to a base-36 string (0-9 and a-z are used to represent numbers).
       substring(2,8) : extracts a substring from the string, starting at index 2 and ending at index 8. as we don't need (0.)
       toUpperCase() : converts the string to uppercase.

       ex. code : GIFT123456
    
    */
}


/**
 * This function is called when the user successfully completes the checkout process. 
 * It retrieves the session from Stripe using the session ID provided in the request body. 
 * If the payment status is "paid", it deactivates the coupon if it exists. 
 * Then it creates a new Order in the database with the user ID, products, total amount, and Stripe session ID. 
 * Finally, it sends a success response with the order ID.
 */
export const checkoutSuccess = async (req, res) => {
	try {
		// Get the session ID from the request body
		const { sessionId } = req.body;

		// Retrieve the session from Stripe using the session ID
		const session = await stripe.checkout.sessions.retrieve(sessionId);

		// Check if the payment status is "paid"
		if (session.payment_status === "paid") {
			// Deactivate the coupon if it exists
			if (session.metadata.couponCode) {
				await Coupon.findOneAndUpdate(
					{
						code: session.metadata.couponCode,
						userId: session.metadata.userId,
					},
					{
						isActive: false,
					}
				);
			}

			// Create a new Order in the database			
			const products = JSON.parse(session.metadata.products);// Parse the products JSON string back into an array of objects
			const newOrder = new Order({
				user: session.metadata.userId,
				products: products.map((product) => ({
					product: product.id,
					quantity: product.quantity,
					price: product.price,
				})),
				totalAmount: session.amount_total / 100, // Convert from cents to dollars
				stripeSessionId: sessionId,
			});

			await newOrder.save();

			// Send a success response with the order ID
			res.status(200).json({
				success: true,
				message: "Payment successful, order created, and coupon deactivated if used.",
				orderId: newOrder._id,
			});
		}
	} catch (error) {
		console.error("Error processing successful checkout:", error);
		res.status(500).json({ message: "Error processing successful checkout", error: error.message });
	}
};
