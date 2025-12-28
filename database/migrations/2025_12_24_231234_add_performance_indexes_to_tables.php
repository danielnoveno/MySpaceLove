<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Spaces table indexes
        if (Schema::hasTable('spaces')) {
            Schema::table('spaces', function (Blueprint $table) {
                if (!$this->hasIndex('spaces', 'spaces_user_one_id_index')) {
                    $table->index('user_one_id');
                }
                if (!$this->hasIndex('spaces', 'spaces_user_two_id_index')) {
                    $table->index('user_two_id');
                }
                if (!$this->hasIndex('spaces', 'spaces_slug_index')) {
                    $table->index('slug');
                }
            });
        }

        // Space invitations indexes
        if (Schema::hasTable('space_invitations')) {
            Schema::table('space_invitations', function (Blueprint $table) {
                if (!$this->hasIndex('space_invitations', 'space_invitations_invitee_email_index')) {
                    $table->index('invitee_email');
                }
                if (!$this->hasIndex('space_invitations', 'space_invitations_status_index')) {
                    $table->index('status');
                }
                if (!$this->hasIndex('space_invitations', 'space_invitations_space_id_index')) {
                    $table->index('space_id');
                }
                if (!$this->hasIndex('space_invitations', 'space_invitations_invitee_id_index')) {
                    $table->index('invitee_id');
                }
            });
        }

        // Love timelines indexes
        if (Schema::hasTable('love_timelines')) {
            Schema::table('love_timelines', function (Blueprint $table) {
                if (!$this->hasIndex('love_timelines', 'love_timelines_space_id_index')) {
                    $table->index('space_id');
                }
                if (!$this->hasIndex('love_timelines', 'love_timelines_date_index')) {
                    $table->index('date');
                }
            });
        }

        // Media galleries indexes
        if (Schema::hasTable('media_galleries')) {
            Schema::table('media_galleries', function (Blueprint $table) {
                if (!$this->hasIndex('media_galleries', 'media_galleries_space_id_index')) {
                    $table->index('space_id');
                }
            });
        }

        // Countdowns indexes
        if (Schema::hasTable('countdowns')) {
            Schema::table('countdowns', function (Blueprint $table) {
                if (!$this->hasIndex('countdowns', 'countdowns_space_id_event_date_index')) {
                    $table->index(['space_id', 'event_date']);
                }
            });
        }

        // Daily messages indexes
        if (Schema::hasTable('daily_messages')) {
            Schema::table('daily_messages', function (Blueprint $table) {
                if (!$this->hasIndex('daily_messages', 'daily_messages_space_id_date_index')) {
                    $table->index(['space_id', 'date']);
                }
            });
        }

        // Messages indexes
        if (Schema::hasTable('messages')) {
            Schema::table('messages', function (Blueprint $table) {
                if (!$this->hasIndex('messages', 'messages_space_id_index')) {
                    $table->index('space_id');
                }
                // Note: sender_user_id already has a composite index with space_id
            });
        }


        // Message reads indexes
        if (Schema::hasTable('message_reads')) {
            Schema::table('message_reads', function (Blueprint $table) {
                if (!$this->hasIndex('message_reads', 'message_reads_message_id_index')) {
                    $table->index('message_id');
                }
                if (!$this->hasIndex('message_reads', 'message_reads_user_id_index')) {
                    $table->index('user_id');
                }
            });
        }

        // Notifications indexes
        if (Schema::hasTable('notifications')) {
            Schema::table('notifications', function (Blueprint $table) {
                if (!$this->hasIndex('notifications', 'notifications_notifiable_type_notifiable_id_index')) {
                    $table->index(['notifiable_type', 'notifiable_id']);
                }
                if (!$this->hasIndex('notifications', 'notifications_read_at_index')) {
                    $table->index('read_at');
                }
            });
        }

        // Love journals indexes
        if (Schema::hasTable('love_journals')) {
            Schema::table('love_journals', function (Blueprint $table) {
                if (!$this->hasIndex('love_journals', 'love_journals_space_id_index')) {
                    $table->index('space_id');
                }
            });
        }

        // Surprise notes indexes
        if (Schema::hasTable('surprise_notes')) {
            Schema::table('surprise_notes', function (Blueprint $table) {
                if (!$this->hasIndex('surprise_notes', 'surprise_notes_space_id_index')) {
                    $table->index('space_id');
                }
            });
        }

        // Wishlist items indexes
        if (Schema::hasTable('wishlist_items')) {
            Schema::table('wishlist_items', function (Blueprint $table) {
                if (!$this->hasIndex('wishlist_items', 'wishlist_items_space_id_index')) {
                    $table->index('space_id');
                }
            });
        }

        // Docs indexes
        if (Schema::hasTable('docs')) {
            Schema::table('docs', function (Blueprint $table) {
                if (!$this->hasIndex('docs', 'docs_space_id_index')) {
                    $table->index('space_id');
                }
            });
        }

        // Space goals indexes
        if (Schema::hasTable('space_goals')) {
            Schema::table('space_goals', function (Blueprint $table) {
                if (!$this->hasIndex('space_goals', 'space_goals_space_id_index')) {
                    $table->index('space_id');
                }
                if (!$this->hasIndex('space_goals', 'space_goals_completed_at_index')) {
                    $table->index('completed_at');
                }
            });
        }

        // Game sessions indexes
        if (Schema::hasTable('game_sessions')) {
            Schema::table('game_sessions', function (Blueprint $table) {
                if (!$this->hasIndex('game_sessions', 'game_sessions_game_id_index')) {
                    $table->index('game_id');
                }
                if (!$this->hasIndex('game_sessions', 'game_sessions_status_index')) {
                    $table->index('status');
                }
            });
        }

        // Game scores indexes
        if (Schema::hasTable('game_scores')) {
            Schema::table('game_scores', function (Blueprint $table) {
                if (!$this->hasIndex('game_scores', 'game_scores_game_id_index')) {
                    $table->index('game_id');
                }
                if (!$this->hasIndex('game_scores', 'game_scores_user_id_index')) {
                    $table->index('user_id');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop indexes in reverse order
        if (Schema::hasTable('game_scores')) {
            Schema::table('game_scores', function (Blueprint $table) {
                $table->dropIndex(['game_id']);
                $table->dropIndex(['user_id']);
            });
        }

        if (Schema::hasTable('game_sessions')) {
            Schema::table('game_sessions', function (Blueprint $table) {
                $table->dropIndex(['game_id']);
                $table->dropIndex(['status']);
            });
        }

        if (Schema::hasTable('space_goals')) {
            Schema::table('space_goals', function (Blueprint $table) {
                $table->dropIndex(['space_id']);
                $table->dropIndex(['completed_at']);
            });
        }

        if (Schema::hasTable('docs')) {
            Schema::table('docs', function (Blueprint $table) {
                $table->dropIndex(['space_id']);
            });
        }

        if (Schema::hasTable('wishlist_items')) {
            Schema::table('wishlist_items', function (Blueprint $table) {
                $table->dropIndex(['space_id']);
            });
        }

        if (Schema::hasTable('surprise_notes')) {
            Schema::table('surprise_notes', function (Blueprint $table) {
                $table->dropIndex(['space_id']);
            });
        }

        if (Schema::hasTable('love_journals')) {
            Schema::table('love_journals', function (Blueprint $table) {
                $table->dropIndex(['space_id']);
            });
        }

        if (Schema::hasTable('notifications')) {
            Schema::table('notifications', function (Blueprint $table) {
                $table->dropIndex(['notifiable_type', 'notifiable_id']);
                $table->dropIndex(['read_at']);
            });
        }

        if (Schema::hasTable('message_reads')) {
            Schema::table('message_reads', function (Blueprint $table) {
                $table->dropIndex(['message_id']);
                $table->dropIndex(['user_id']);
            });
        }

        if (Schema::hasTable('messages')) {
            Schema::table('messages', function (Blueprint $table) {
                $table->dropIndex(['space_id']);
            });
        }


        if (Schema::hasTable('daily_messages')) {
            Schema::table('daily_messages', function (Blueprint $table) {
                $table->dropIndex(['space_id', 'date']);
            });
        }

        if (Schema::hasTable('countdowns')) {
            Schema::table('countdowns', function (Blueprint $table) {
                $table->dropIndex(['space_id', 'event_date']);
            });
        }

        if (Schema::hasTable('media_galleries')) {
            Schema::table('media_galleries', function (Blueprint $table) {
                $table->dropIndex(['space_id']);
            });
        }

        if (Schema::hasTable('love_timelines')) {
            Schema::table('love_timelines', function (Blueprint $table) {
                $table->dropIndex(['space_id']);
                $table->dropIndex(['date']);
            });
        }

        if (Schema::hasTable('space_invitations')) {
            Schema::table('space_invitations', function (Blueprint $table) {
                $table->dropIndex(['invitee_email']);
                $table->dropIndex(['status']);
                $table->dropIndex(['space_id']);
                $table->dropIndex(['invitee_id']);
            });
        }

        if (Schema::hasTable('spaces')) {
            Schema::table('spaces', function (Blueprint $table) {
                $table->dropIndex(['user_one_id']);
                $table->dropIndex(['user_two_id']);
                $table->dropIndex(['slug']);
            });
        }
    }

    /**
     * Check if an index exists on a table
     */
    private function hasIndex(string $table, string $index): bool
    {
        $connection = Schema::getConnection();
        $database = $connection->getDatabaseName();
        
        $result = $connection->select(
            "SELECT COUNT(*) as count FROM information_schema.statistics 
             WHERE table_schema = ? AND table_name = ? AND index_name = ?",
            [$database, $table, $index]
        );
        
        return $result[0]->count > 0;
    }
};
