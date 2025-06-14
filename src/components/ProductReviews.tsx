
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Review {
  id: string;
  rating: number;
  comment: string;
  user_name: string;
  created_at: string;
}

interface ProductReviewsProps {
  productId: string;
}

const ProductReviews = ({ productId }: ProductReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [userReview, setUserReview] = useState<Review | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadReviews();
    checkUserReview();
  }, [productId]);

  const loadReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (err) {
      console.error('Error loading reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkUserReview = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .single();

      if (data) {
        setUserReview(data);
        setNewRating(data.rating);
        setNewComment(data.comment || '');
      }
    } catch (err) {
      // User hasn't reviewed yet
    }
  };

  const handleSubmitReview = async () => {
    if (newRating === 0) {
      toast({
        title: "Please select a rating",
        description: "You must select at least 1 star to submit a review.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Please login",
          description: "You need to login to submit a review.",
          variant: "destructive",
        });
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      const reviewData = {
        product_id: productId,
        rating: newRating,
        comment: newComment,
        user_name: profile?.full_name || 'Anonymous',
      };

      let error;
      if (userReview) {
        // Update existing review
        const result = await supabase
          .from('reviews')
          .update(reviewData)
          .eq('id', userReview.id);
        error = result.error;
      } else {
        // Create new review
        const result = await supabase
          .from('reviews')
          .insert([{ ...reviewData, user_id: user.id }]);
        error = result.error;
      }

      if (error) throw error;

      toast({
        title: "Review submitted!",
        description: userReview ? "Your review has been updated." : "Thank you for your review!",
      });

      setNewRating(0);
      setNewComment('');
      loadReviews();
      checkUserReview();
    } catch (err) {
      console.error('Error submitting review:', err);
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  return (
    <div className="space-y-8">
      {/* Reviews Summary */}
      <Card className="bg-card/60 backdrop-blur-md border border-border/50 rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-4">
            <span>Customer Reviews</span>
            {reviews.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-5 h-5 ${
                        i < Math.floor(averageRating) 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300'
                      }`} 
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {averageRating.toFixed(1)} ({reviews.length} reviews)
                </span>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Review Form */}
          <div className="mb-8 p-6 bg-muted/50 rounded-xl">
            <h4 className="font-semibold mb-4">
              {userReview ? 'Update your review' : 'Write a review'}
            </h4>
            
            {/* Star Rating */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setNewRating(star)}
                    className="transition-colors duration-200"
                  >
                    <Star 
                      className={`w-8 h-8 ${
                        star <= newRating 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300 hover:text-yellow-200'
                      }`} 
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Comment (optional)</label>
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts about this product..."
                className="bg-background/80 border-border/50 rounded-xl"
                rows={3}
              />
            </div>

            <Button 
              onClick={handleSubmitReview}
              disabled={submitting || newRating === 0}
              className="bg-primary hover:bg-primary/90 rounded-xl"
            >
              {submitting ? 'Submitting...' : userReview ? 'Update Review' : 'Submit Review'}
            </Button>
          </div>

          {/* Reviews List */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="p-4 bg-background/50 rounded-xl border border-border/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{review.user_name}</span>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${
                              i < review.rating 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            }`} 
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-muted-foreground">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductReviews;
