import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useAuthStore } from "@/lib/auth-store";
import { useColors } from "@/hooks/useColors";
import { api } from "@/lib/api";
import { UserPlus, Shield, User, Trash2 } from "lucide-react-native";

interface Member {
  userId: string;
  role: string;
  name: string | null;
  email: string;
  image: string | null;
}

export default function TeamScreen() {
  const colors = useColors();
  const activeOrg = useAuthStore((s) => s.activeOrg);
  const currentUser = useAuthStore((s) => s.user);

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [inviting, setInviting] = useState(false);

  const isAdmin =
    activeOrg?.role === "owner" || activeOrg?.role === "admin";

  const fetchMembers = useCallback(async () => {
    if (!activeOrg) return;
    try {
      const result = await api<{ members: Member[] }>(
        `/api/mobile/orgs/${activeOrg.id}/members`
      );
      setMembers(result.members);
    } catch (err) {
      console.error("Team fetch error:", err);
    }
  }, [activeOrg?.id]);

  useEffect(() => {
    fetchMembers().finally(() => setLoading(false));
  }, [fetchMembers]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMembers();
    setRefreshing(false);
  }, [fetchMembers]);

  async function handleInvite() {
    if (!activeOrg || !inviteEmail.trim()) return;
    setInviting(true);
    try {
      await api(`/api/mobile/orgs/${activeOrg.id}/members`, {
        method: "POST",
        body: { email: inviteEmail.trim(), role: "member" },
      });
      setInviteEmail("");
      setShowInvite(false);
      Alert.alert("Invited", "Team member invited successfully.");
      await fetchMembers();
    } catch {
      Alert.alert("Error", "Failed to invite member");
    } finally {
      setInviting(false);
    }
  }

  async function handleRemove(userId: string, name: string | null) {
    if (!activeOrg) return;
    Alert.alert(
      "Remove Member",
      `Remove ${name ?? "this member"} from the team?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await api(
                `/api/mobile/orgs/${activeOrg.id}/members/${userId}`,
                { method: "DELETE" }
              );
              await fetchMembers();
            } catch {
              Alert.alert("Error", "Failed to remove member");
            }
          },
        },
      ]
    );
  }

  async function handleRoleChange(
    userId: string,
    currentRole: string
  ) {
    if (!activeOrg) return;
    const newRole = currentRole === "admin" ? "member" : "admin";
    try {
      await api(
        `/api/mobile/orgs/${activeOrg.id}/members/${userId}`,
        { method: "PUT", body: { role: newRole } }
      );
      await fetchMembers();
    } catch {
      Alert.alert("Error", "Failed to update role");
    }
  }

  function getRoleIcon(role: string) {
    if (role === "owner") return Shield;
    if (role === "admin") return Shield;
    return User;
  }

  const renderMember = ({ item }: { item: Member }) => {
    const RoleIcon = getRoleIcon(item.role);
    const isSelf = item.userId === currentUser?.id;
    const isOwner = item.role === "owner";

    return (
      <View
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        <View style={styles.memberRow}>
          <RoleIcon
            size={18}
            color={
              item.role === "owner"
                ? colors.warning
                : item.role === "admin"
                  ? colors.primary
                  : colors.textSecondary
            }
          />
          <View style={styles.memberInfo}>
            <Text style={[styles.memberName, { color: colors.text }]}>
              {item.name ?? item.email}
              {isSelf ? " (you)" : ""}
            </Text>
            <Text style={[styles.memberEmail, { color: colors.textSecondary }]}>
              {item.email}
            </Text>
          </View>
          <View
            style={[
              styles.roleBadge,
              {
                backgroundColor:
                  item.role === "owner"
                    ? colors.warning + "20"
                    : item.role === "admin"
                      ? colors.primary + "20"
                      : colors.textSecondary + "20",
              },
            ]}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: "600",
                color:
                  item.role === "owner"
                    ? colors.warning
                    : item.role === "admin"
                      ? colors.primary
                      : colors.textSecondary,
                textTransform: "capitalize",
              }}
            >
              {item.role}
            </Text>
          </View>
        </View>

        {isAdmin && !isSelf && !isOwner && (
          <View style={styles.memberActions}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleRoleChange(item.userId, item.role)}
            >
              <Text style={{ fontSize: 13, color: colors.primary }}>
                Make {item.role === "admin" ? "member" : "admin"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleRemove(item.userId, item.name)}
            >
              <Trash2 size={14} color={colors.danger} />
              <Text style={{ fontSize: 13, color: colors.danger }}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {isAdmin && (
        <View style={styles.inviteSection}>
          {showInvite ? (
            <View style={styles.inviteForm}>
              <TextInput
                style={[
                  styles.inviteInput,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                placeholder="Email address"
                placeholderTextColor={colors.textSecondary}
                value={inviteEmail}
                onChangeText={setInviteEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <TouchableOpacity
                style={[styles.inviteButton, { backgroundColor: colors.primary }]}
                onPress={handleInvite}
                disabled={inviting}
              >
                {inviting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={{ color: "#fff", fontWeight: "600" }}>
                    Invite
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.primaryLight }]}
              onPress={() => setShowInvite(true)}
            >
              <UserPlus size={18} color={colors.primary} />
              <Text style={{ color: colors.primary, fontWeight: "600" }}>
                Invite Member
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <FlatList
        data={members}
        keyExtractor={(item) => item.userId}
        renderItem={renderMember}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  inviteSection: { paddingHorizontal: 16, paddingTop: 12 },
  inviteForm: { flexDirection: "row", gap: 10 },
  inviteInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  inviteButton: {
    height: 44,
    paddingHorizontal: 20,
    borderRadius: 10,
    justifyContent: "center",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 44,
    borderRadius: 10,
  },
  list: { padding: 16 },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  memberRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 15, fontWeight: "600" },
  memberEmail: { fontSize: 13, marginTop: 2 },
  roleBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  memberActions: {
    flexDirection: "row",
    gap: 16,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e5e5e5",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});
