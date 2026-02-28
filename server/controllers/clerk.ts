// import { verifyWebhook } from '@clerk/express/webhooks';
// import { Request, Response } from "express";
// import { prisma } from "../configs/prisma.js";

// const ClerkWebhooks = async (req: Request, res: Response) => {
//   try {
//     // 1. Verify the signature (Crucial for security)
//     const evt = await verifyWebhook(req);
//     const { type, data } = evt;

//     // 2. Extract common data
//     // Clerk sends email_addresses as an array. We usually want the first one.
//     const id = data.id;
//     const email = (data as any).email_addresses?.[0]?.email_address;
//     const name = `${(data as any).first_name || ""} ${(data as any).last_name || ""}`.trim();
//     const image = (data as any).image_url;

//     switch (type) {
//       case "user.created":
//       case "user.updated": {
//         // Use UPSERT: It creates the user if they don't exist, or updates them if they do.
//         await prisma.user.upsert({
//           where: { id: id },
//           update: {
//             email: email,
//             name: name,
//             image: image,
//           },
//           create: {
//             id: id,
//             email: email,
//             name: name,
//             image: image,
//           },
//         });
//         break;
//       }
//       case "user.deleted": {
//         await prisma.user.delete({
//           where: { id: data.id },
//         });
//         break;
//       }
//       case "paymentAttempt.updated": {
//         if((data.charge_type === "recurring" || data.charge_type === "checkout") && data.status === "paid"){
//             const credits = {pro : 80 , premium : 240 ,}
//             const clerkUserId = data?.payer?.user_id;
//             const planId = data?.subscription_items[0]?.plan?.slug;
//             if(planId != "pro" && planId != "premium") {
//                 return res.status(400).json({message : "Invalid plan ID"})
//             }
//             console.log(planId)

//             await prisma.user.update({
//                 where : {id : clerkUserId},
//                 data : {credits : {increment : credits[planId]}}
//         })
//         }
//         break;
//       }
//         default:
//             break;


//     }

//     // 3. Always return a 200 status to Clerk so it stops retrying
//     return res.status(200).json({ success: true });

//   } catch (error: any) {
//     console.error("Webhook Error:", error.message);
//     return res.status(400).json({ 
//       message: error.message || "Webhook verification failed" 
//     });
//   }
// };

// export default ClerkWebhooks;


import { verifyWebhook } from '@clerk/express/webhooks';
import { Request, Response } from "express";
import { prisma } from "../configs/prisma.js";
import * as Sentry from "@sentry/node";
const ClerkWebhooks = async (req: Request, res: Response) => {
  try {
    // 1. Verify the signature
    const evt = await verifyWebhook(req);
    const { type, data } = evt;

    // 2. Extract common user data
    const id = data.id;
    const email = (data as any).email_addresses?.[0]?.email_address;
    const name = `${(data as any).first_name || ""} ${(data as any).last_name || ""}`.trim();
    const image = (data as any).image_url;

    switch (type) {
      case "user.created":
      case "user.updated": {
        await prisma.user.upsert({
          where: { id: id },
          update: { email, name, image },
          create: { id, email, name, image },
        });
        break;
      }

      case "user.deleted": {
        // Ensure id exists before deleting
        if (id) {
          await prisma.user.delete({ where: { id: id } });
        }
        break;
      }

      case "paymentAttempt.updated": {
        const status = (data as any).status;
        const chargeType = (data as any).charge_type;

        if ((chargeType === "recurring" || chargeType === "checkout") && status === "paid") {
          const creditsMap = { pro: 80, premium: 240 } as const;
          
          const clerkUserId = (data as any).payer?.user_id;
          const planSlug = (data as any).subscription_items?.[0]?.plan?.slug;

          // Validate plan and user
          if (!planSlug || !(planSlug in creditsMap)) {
            console.error("Invalid or missing plan ID:", planSlug);
            return res.status(400).json({ message: "Invalid plan ID" });
          }

          if (!clerkUserId) {
            console.error("No user ID found in payment attempt");
            return res.status(400).json({ message: "User ID missing" });
          }

          // Update user credits
          const amountToAdd = creditsMap[planSlug as keyof typeof creditsMap];
          
          await prisma.user.update({
            where: { id: clerkUserId },
            data: { credits: { increment: amountToAdd } }
          });

          console.log(`Added ${amountToAdd} credits to user ${clerkUserId}`);
        }
        break;
      }

      default:
        console.log(`Unhandled webhook type: ${type}`);
        break;
    }

    // 3. Success Response
    res.json({message : "Webhook Received : " + type});

  } catch (error: any) {
    Sentry.captureException(error);
    console.error("Webhook Error:", error.message);
    return res.status(400).json({ 
      message: error.message || "Webhook verification failed" 
    });
  }
};

export default ClerkWebhooks;