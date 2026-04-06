import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function DELETE() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const userId = user.id;

  try {
    // Delete in order: dependents first, then parent records
    // price_snapshots reference watches, so delete them first
    await admin
      .from("price_snapshots")
      .delete()
      .in(
        "watch_id",
        (
          await admin
            .from("watches")
            .select("id")
            .eq("user_id", userId)
        ).data?.map((w) => w.id) ?? []
      );

    // Delete watches
    await admin.from("watches").delete().eq("user_id", userId);

    // Delete daily usage
    await admin.from("daily_usage").delete().eq("user_id", userId);

    // Delete notifications
    await admin.from("notifications").delete().eq("user_id", userId);

    // Delete subscriptions
    await admin.from("subscriptions").delete().eq("user_id", userId);

    // Delete profile
    await admin.from("profiles").delete().eq("id", userId);

    // Delete the auth user last
    const { error: authError } = await admin.auth.admin.deleteUser(userId);

    if (authError) {
      console.error("Failed to delete auth user:", authError);
      return NextResponse.json(
        { error: "Failed to delete account. Please contact support." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Account deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete account. Please contact support." },
      { status: 500 }
    );
  }
}
