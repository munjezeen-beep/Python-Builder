import { useState } from "react";
import { useKeywords, useCreateKeyword, useDeleteKeyword } from "@/hooks/use-keywords";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, KeySquare, X, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Keywords() {
  const { data: keywords, isLoading } = useKeywords();
  const createKeyword = useCreateKeyword();
  const deleteKeyword = useDeleteKeyword();

  const [word, setWord] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim()) return;
    createKeyword.mutate({ word: word.trim() }, {
      onSuccess: () => setWord('')
    });
  };

  if (isLoading) return <div className="flex h-40 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-card/40 p-8 rounded-3xl border border-border/50 glass-card">
        <div>
          <h2 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/20 text-primary"><KeySquare className="w-6 h-6" /></div>
            Target Keywords
          </h2>
          <p className="text-muted-foreground mt-2 text-lg">Define the trigger phrases that radar will intercept.</p>
        </div>
      </div>

      <div className="bg-card/30 border border-border/50 p-6 rounded-3xl backdrop-blur-sm shadow-xl shadow-black/5">
        <form onSubmit={handleSubmit} className="flex gap-3 mb-8">
          <Input 
            value={word} 
            onChange={(e) => setWord(e.target.value)} 
            placeholder="Type a phrase (e.g. 'ابي احد يحل') and press Enter..." 
            className="h-14 text-lg bg-background/50 border-border/60 focus:ring-primary/30 rounded-xl px-6"
          />
          <Button type="submit" disabled={createKeyword.isPending} className="h-14 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg shadow-lg hover:shadow-primary/25 transition-all">
            {createKeyword.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5 mr-2" /> Add</>}
          </Button>
        </form>

        <div className="flex flex-wrap gap-3">
          <AnimatePresence>
            {keywords?.length === 0 && (
              <motion.p initial={{opacity:0}} animate={{opacity:1}} className="text-muted-foreground text-center w-full py-8">
                No keywords defined. Add some to start monitoring.
              </motion.p>
            )}
            {keywords?.map(kw => (
              <motion.div
                key={kw.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="flex items-center gap-2 bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-full border border-border/50 shadow-sm group hover:border-primary/40 transition-colors"
              >
                <span className="font-medium">{kw.word}</span>
                <button
                  onClick={() => deleteKeyword.mutate(kw.id)}
                  disabled={deleteKeyword.isPending}
                  className="ml-2 text-muted-foreground hover:text-destructive transition-colors focus:outline-none"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
